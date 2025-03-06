import { Request, Response } from "express";
import { z } from "zod";
import { ScraperFactory } from "../lib/scraping/ScraperFactory";
import { AgentService } from "../lib/services/AgentService";
import { Database } from "../types/database.types";
import { STEP_OF_AGENT } from "../lib/step";
import { createAgent } from "../lib/supabase/createAgent";
import updateAgentStatus from "../lib/supabase/updateAgentStatus";
import createAgentStatus from "../lib/supabase/createAgentStatus";
import runSpotifyAgent from "../agents/runSpotifyAgent";
import { generateSegmentsForAccount } from "../lib/services/segmentService";
import { getProfileUrl } from "../lib/utils/getProfileUrl";

type DbAgentStatus = Database["public"]["Tables"]["agent_status"]["Row"];

// Input validation schema
const HandlesSchema = z.object({
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  spotify: z.string().optional(),
});

const RequestSchema = z.object({
  handles: HandlesSchema,
  artistId: z.string().optional(),
});

type SocialType = Database["public"]["Enums"]["social_type"];

export class PilotController {
  private agentService: AgentService;

  constructor() {
    this.agentService = new AgentService();
  }

  public run_agent = async (req: Request, res: Response) => {
    try {
      // Validate request
      const validationResult = RequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.error("❌ Invalid request:", validationResult.error);
        return res.status(400).json({
          message: "Invalid request format",
          errors: validationResult.error.errors,
        });
      }

      const { handles, artistId } = validationResult.data;

      // Validate at least one handle exists
      if (!Object.values(handles).some((h) => h?.trim())) {
        console.error("❌ No handles provided");
        return res.status(400).json({ message: "No handles provided." });
      }

      // Create agent
      const { agent, error: agentError } = await createAgent();
      if (agentError || !agent) {
        console.error("❌ Failed to create agent:", agentError);
        return res.status(500).json({ message: "Failed to create agent." });
      }

      // Return agent ID immediately
      res.status(200).json({ agentId: agent.id });

      // Process platforms in background
      this.processPlatforms(agent.id, handles, artistId).catch((error) => {
        console.error("❌ Background processing error:", error);
      });
    } catch (error) {
      console.error("❌ Error in run_agent:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  private async processPlatforms(
    agentId: string,
    handles: z.infer<typeof HandlesSchema>,
    artistId?: string
  ) {
    // Helper function to check if all platforms are complete
    const areAllPlatformsComplete = async (
      agentId: string
    ): Promise<boolean> => {
      console.log(`Checking completion status for agentId: ${agentId}`);
      const { data } = await this.agentService.getAgentStatus(agentId);
      if (!data) {
        console.log(`No agent status data found for agentId: ${agentId}`);
        return false;
      }

      // Consider both FINISHED and ERROR states as complete
      const isComplete = data.statuses.every((status: DbAgentStatus) => {
        if (status.status === null) return false;

        const isTerminalState =
          status.status === STEP_OF_AGENT.FINISHED ||
          status.status === STEP_OF_AGENT.ERROR ||
          status.status === STEP_OF_AGENT.MISSING_POSTS ||
          status.status === STEP_OF_AGENT.RATE_LIMIT_EXCEEDED ||
          status.status === STEP_OF_AGENT.UNKNOWN_PROFILE;

        if (isTerminalState) {
          console.log(
            `Status ${status.id} is in terminal state: ${status.status !== null ? STEP_OF_AGENT[status.status] : "null"}`
          );
        }

        return isTerminalState;
      });

      console.log(
        `All platforms complete for agentId ${agentId}: ${isComplete}`
      );
      if (isComplete) {
        console.log(
          "Final status breakdown:",
          data.statuses.map((s) => ({
            id: s.id,
            status: s.status !== null ? STEP_OF_AGENT[s.status] : "null",
            social_id: s.social_id,
          }))
        );
      }
      return isComplete;
    };

    // Helper function to update all agent statuses
    const updateAllAgentStatuses = async (
      agentId: string,
      status: STEP_OF_AGENT
    ): Promise<void> => {
      const { data } = await this.agentService.getAgentStatus(agentId);
      if (!data) {
        return;
      }
      await Promise.all(
        data.statuses.map((agentStatus: DbAgentStatus) =>
          updateAgentStatus(agentStatus.id, status)
        )
      );
    };

    // Helper function to process a platform
    const processPlatform = async (platform: SocialType, handle: string) => {
      try {
        // Get platform-specific scraper
        const scraper = ScraperFactory.getScraper(platform);

        // Create social record first
        const { social, error: socialError } =
          await this.agentService.createSocial({
            username: handle.replaceAll("@", ""),
            profile_url: getProfileUrl(platform, handle),
          });
        if (socialError || !social) {
          console.error(
            `❌ Failed to create social record for ${platform}:`,
            socialError
          );
          return;
        }

        // Create agent status with social.id
        const { agent_status } = await createAgentStatus(
          agentId,
          social.id,
          STEP_OF_AGENT.PROFILE
        );
        if (!agent_status?.id) return;

        // Scrape profile
        const profile = await scraper.scrapeProfile(handle.replaceAll("@", ""));

        // Update social record with profile data
        await this.agentService.updateSocial(social.id, profile);

        // Handle artist setup if needed
        if (artistId) {
          await updateAgentStatus(
            agent_status.id,
            STEP_OF_AGENT.SETTING_UP_ARTIST
          );
        }

        // Fetch posts
        await updateAgentStatus(agent_status.id, STEP_OF_AGENT.POSTURLS);
        const posts = await scraper.scrapePosts(handle.replaceAll("@", ""));

        // Fetch comments
        await updateAgentStatus(agent_status.id, STEP_OF_AGENT.POST_COMMENTS);
        const comments = await scraper.scrapeComments(
          posts.map((p) => p.post_url)
        );

        // Store all data
        console.log("Scrape completed. Storing data...");
        await this.agentService.storeSocialData({
          agentStatusId: agent_status.id,
          profile,
          posts,
          comments,
          artistId,
        });

        console.log("Stored data. Updating final status...");
        await updateAgentStatus(agent_status.id, STEP_OF_AGENT.FINISHED);
      } catch (error) {
        console.error(`❌ Error processing ${platform}:`, error);
        // Don't throw here - we want to continue with other platforms
      }
    };

    // Process each platform
    const tasks: Promise<void>[] = [];
    if (handles.instagram?.trim()) {
      tasks.push(processPlatform("INSTAGRAM", handles.instagram));
    }
    if (handles.twitter?.trim()) {
      tasks.push(processPlatform("TWITTER", handles.twitter));
    }
    if (handles.tiktok?.trim()) {
      tasks.push(processPlatform("TIKTOK", handles.tiktok));
    }
    if (handles.spotify?.trim()) {
      tasks.push(runSpotifyAgent(agentId, handles.spotify, artistId || ""));
    }

    // Wait for all platforms to be processed
    await Promise.all(tasks);

    // Generate segments if all platforms are complete and artistId is provided
    if ((await areAllPlatformsComplete(agentId)) && artistId) {
      console.log("All platforms complete. Starting segment generation...");
      try {
        await updateAllAgentStatuses(agentId, STEP_OF_AGENT.SEGMENTS);
        await generateSegmentsForAccount(artistId);
        await updateAllAgentStatuses(agentId, STEP_OF_AGENT.FINISHED);
        console.log("Segment generation completed successfully.");
      } catch (error) {
        console.error("❌ Error generating segments:", error);
        // Update statuses back to FINISHED on error
        await updateAllAgentStatuses(agentId, STEP_OF_AGENT.FINISHED);
      }
    }
  }
}
