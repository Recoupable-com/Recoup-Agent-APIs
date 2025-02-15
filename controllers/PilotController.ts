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
import runTikTokAgent from "../agents/runTikTokAgent";
import runTwitterAgent from "../agents/runTwitterAgent";

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
    // Helper function to process a platform
    const processPlatform = async (platform: SocialType, handle: string) => {
      try {
        // Get platform-specific scraper
        const scraper = ScraperFactory.getScraper(platform);

        // Scrape profile first to get social data
        const profile = await scraper.scrapeProfile(handle.replaceAll("@", ""));

        // Create social record
        const { social, error: socialError } =
          await this.agentService.createSocial(profile);
        if (socialError || !social) {
          console.error(
            `❌ Failed to create social record for ${platform}:`,
            socialError
          );
          return;
        }

        // Create initial status
        const { agent_status } = await createAgentStatus(
          agentId,
          social.id,
          STEP_OF_AGENT.PROFILE
        );
        if (!agent_status?.id) return;

        // Scrape remaining data
        const scrapedData = await scraper.scrapeAll(handle.replaceAll("@", ""));
        console.log("Scrape completed. Storing data...");
        // Store data using agent service
        await this.agentService.storeSocialData({
          agentStatusId: agent_status.id,
          profile: scrapedData.profile,
          posts: scrapedData.posts,
          comments: scrapedData.comments,
          artistId,
        });

        console.log("Stored data. Updating final status...");

        // Update final status
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
      tasks.push(runTwitterAgent(agentId, handles.twitter, artistId || ""));
    }
    if (handles.tiktok?.trim()) {
      tasks.push(runTikTokAgent(agentId, handles.tiktok, artistId || ""));
    }
    if (handles.spotify?.trim()) {
      tasks.push(runSpotifyAgent(agentId, handles.spotify, artistId || ""));
    }

    // Wait for all platforms to be processed
    await Promise.all(tasks);
  }
}
