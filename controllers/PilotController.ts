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
import {
  ScrapedComment,
  ScrapedProfile,
  ScrapedPost,
} from "../lib/scraping/types";
import enhanceAuthorsWithAvatars from "../lib/scraping/enhanceAuthorsWithAvatar";
import createSocials from "../lib/supabase/createSocials";
import { EnhancedSocial } from "../types/agent";
import getSocialPlatformByLink from "../lib/getSocialPlatformByLink";
import { isValidPlatform } from "../lib/utils/validatePlatform";

type DbAgentStatus = Database["public"]["Tables"]["agent_status"]["Row"];

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
    console.log("[INFO] Starting agent run:", {
      body: {
        ...req.body,
        handles: Object.entries(req.body.handles || {}).reduce(
          (acc, [k, v]) => ({
            ...acc,
            [k]: v,
          }),
          {}
        ),
      },
    });

    try {
      const validationResult = RequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.error("[ERROR] Invalid request format:", {
          errors: validationResult.error.errors,
          body: req.body,
        });
        return res.status(400).json({
          message: "Invalid request format",
          errors: validationResult.error.errors,
        });
      }

      const { handles, artistId } = validationResult.data;
      console.log("[DEBUG] Validated request data:", {
        handles: Object.entries(handles).reduce(
          (acc, [k, v]) => ({
            ...acc,
            [k]: v,
          }),
          {}
        ),
        artistId,
      });

      if (!Object.values(handles).some((h) => h?.trim())) {
        console.error("[ERROR] No handles provided in request");
        return res.status(400).json({ message: "No handles provided." });
      }

      console.log("[DEBUG] Creating new agent");
      const { agent, error: agentError } = await createAgent();
      if (agentError || !agent) {
        console.error("[ERROR] Failed to create agent:", {
          error:
            agentError instanceof Error
              ? {
                  message: agentError.message,
                  stack: agentError.stack,
                }
              : String(agentError),
        });
        return res.status(500).json({ message: "Failed to create agent." });
      }

      console.log("[INFO] Agent created successfully:", {
        agentId: agent.id,
      });

      // Return agent ID immediately
      res.status(200).json({ agentId: agent.id });

      // Process platforms in background
      console.log("[DEBUG] Starting background platform processing:", {
        agentId: agent.id,
        platforms: Object.keys(handles).filter((k) =>
          handles[k as keyof typeof handles]?.trim()
        ),
      });

      this.processPlatforms(agent.id, handles, artistId).catch((error) => {
        console.error("[ERROR] Background processing failed:", {
          agentId: agent.id,
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                }
              : String(error),
        });
      });
    } catch (error) {
      console.error("[ERROR] Unhandled error in run_agent:", {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : String(error),
      });
      return res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  private async createInitialCommentSocials(
    comments: ScrapedComment[]
  ): Promise<{ [username: string]: string }> {
    const uniqueAuthors = [
      ...new Set(comments.map((comment) => comment.username)),
    ];

    console.log(
      "[DEBUG] Creating initial social records for comment authors:",
      {
        authorCount: uniqueAuthors.length,
      }
    );

    // Map comments to author objects
    const authors = uniqueAuthors
      .map((username) => {
        const comment = comments.find((c) => c.username === username);
        if (!comment) return null;
        return {
          username,
          profile_url: comment.profile_url,
        };
      })
      .filter(
        (author): author is NonNullable<typeof author> => author !== null
      );

    const { socialMap, error } = await createSocials(authors);

    if (error) {
      console.error("[ERROR] Failed to create initial social records:", {
        error: error.message,
        authorCount: uniqueAuthors.length,
      });
      return {};
    }

    console.log("[DEBUG] Created initial social records:", {
      totalCreated: Object.keys(socialMap).length,
      totalAuthors: uniqueAuthors.length,
    });

    return socialMap;
  }

  private async enhanceCommentSocials(
    comments: ScrapedComment[]
  ): Promise<EnhancedSocial[]> {
    const uniqueAuthors = [
      ...new Set(comments.map((comment) => comment.username)),
    ];

    console.log("[DEBUG] Enhancing social records for comment authors:", {
      authorCount: uniqueAuthors.length,
    });

    try {
      const authors = uniqueAuthors
        .map((username) => {
          const comment = comments.find((c) => c.username === username);
          if (!comment) return null;
          return {
            username,
            profile_url: comment.profile_url,
          };
        })
        .filter((author) => author !== null);

      const enhancedProfiles = await enhanceAuthorsWithAvatars(authors);

      console.log("[DEBUG] Enhanced social records:", {
        totalEnhanced: enhancedProfiles.length,
        totalAuthors: authors.length,
      });

      // Update each social record with enhanced data
      for (const profile of enhancedProfiles) {
        const scrapedProfile: ScrapedProfile = {
          username: profile.username,
          profile_url: profile.profile_url,
          avatar: profile.avatar ?? undefined,
          followerCount: profile.followerCount ?? undefined,
          followingCount: profile.followingCount ?? undefined,
          description: profile.bio ?? undefined,
        };
        await this.agentService.updateSocial(profile.id, scrapedProfile);
      }

      return enhancedProfiles;
    } catch (error) {
      console.error("[ERROR] Failed to enhance comment socials:", {
        error: error instanceof Error ? error.message : String(error),
        authorCount: uniqueAuthors.length,
      });
      // Return empty array instead of throwing - we want to continue even if enhancement fails
      return [];
    }
  }

  private async processFanPosts(
    enhancedProfiles: EnhancedSocial[],
    agentStatusId: string,
    socialMap: { [username: string]: string }
  ): Promise<void> {
    console.log("[DEBUG] Processing fan posts:", {
      profileCount: enhancedProfiles.length,
      agentStatusId,
    });

    try {
      // Filter profiles that have post URLs
      const profilesWithPosts = enhancedProfiles.filter(
        (profile) => profile.postUrls && profile.postUrls.length > 0
      );

      console.log("[DEBUG] Found profiles with posts:", {
        totalProfiles: enhancedProfiles.length,
        profilesWithPosts: profilesWithPosts.length,
      });

      // Process each profile's posts
      for (const profile of profilesWithPosts) {
        if (!profile.postUrls?.length) continue;

        console.log("[DEBUG] Processing posts for profile:", {
          username: profile.username,
          postCount: profile.postUrls.length,
        });

        // Use existing socialMap instead of making a new DB call
        const socialId = socialMap[profile.username];
        if (!socialId) {
          console.error("[ERROR] No social ID found for profile:", {
            username: profile.username,
          });
          continue;
        }

        // Convert post URLs to ScrapedPost format
        const platform = getSocialPlatformByLink(profile.profile_url);
        if (!isValidPlatform(platform)) {
          console.error("[ERROR] Invalid platform detected:", {
            platform,
            profileUrl: profile.profile_url,
          });
          continue;
        }
        const posts: ScrapedPost[] = profile.postUrls.map((url) => ({
          post_url: url,
          platform,
        }));

        // Store posts using existing AgentService method
        const { error: postsError } = await this.agentService.storePosts({
          socialId,
          posts,
        });

        if (postsError) {
          console.error("[ERROR] Failed to store fan posts:", {
            username: profile.username,
            error: postsError.message,
          });
          continue;
        }

        console.log("[DEBUG] Successfully stored fan posts:", {
          username: profile.username,
          postCount: posts.length,
        });
      }
    } catch (error) {
      console.error("[ERROR] Failed to process fan posts:", {
        error: error instanceof Error ? error.message : String(error),
        agentStatusId,
      });
      // Don't throw - we want to continue even if fan post processing fails
    }
  }

  private async processPlatforms(
    agentId: string,
    handles: z.infer<typeof HandlesSchema>,
    artistId?: string
  ) {
    console.log("[INFO] Processing platforms:", {
      agentId,
      platforms: Object.keys(handles).filter((k) =>
        handles[k as keyof typeof handles]?.trim()
      ),
      hasArtistId: !!artistId,
    });

    const areAllPlatformsComplete = async (
      agentId: string
    ): Promise<boolean> => {
      console.log("[DEBUG] Checking platform completion status:", {
        agentId,
      });

      const { data } = await this.agentService.getAgentStatus(agentId);
      if (!data) {
        console.warn("[WARN] No agent status data found:", {
          agentId,
        });
        return false;
      }

      const statusBreakdown = data.statuses.map((status: DbAgentStatus) => ({
        id: status.id,
        status: status.status !== null ? STEP_OF_AGENT[status.status] : "null",
        social_id: status.social_id,
        isComplete:
          status.status === STEP_OF_AGENT.FINISHED ||
          status.status === STEP_OF_AGENT.ERROR ||
          status.status === STEP_OF_AGENT.MISSING_POSTS ||
          status.status === STEP_OF_AGENT.RATE_LIMIT_EXCEEDED ||
          status.status === STEP_OF_AGENT.UNKNOWN_PROFILE,
      }));

      const isComplete = statusBreakdown.every((s) => s.isComplete);

      console.log("[DEBUG] Platform completion check result:", {
        agentId,
        isComplete,
        statusBreakdown,
      });

      return isComplete;
    };

    const updateAllAgentStatuses = async (
      agentId: string,
      status: STEP_OF_AGENT
    ): Promise<void> => {
      console.log("[DEBUG] Updating all agent statuses:", {
        agentId,
        newStatus: STEP_OF_AGENT[status],
      });

      const { data } = await this.agentService.getAgentStatus(agentId);
      if (!data) {
        console.warn("[WARN] No agent status data found for update:", {
          agentId,
        });
        return;
      }

      await Promise.all(
        data.statuses.map((agentStatus: DbAgentStatus) =>
          updateAgentStatus(agentStatus.id, status)
        )
      );

      console.log("[DEBUG] Updated all agent statuses:", {
        agentId,
        newStatus: STEP_OF_AGENT[status],
        updatedStatusCount: data.statuses.length,
      });
    };

    const processPlatform = async (platform: SocialType, handle: string) => {
      console.log("[INFO] Processing platform:", {
        agentId,
        platform,
        handle,
      });

      try {
        const scraper = ScraperFactory.getScraper(platform);
        console.log("[DEBUG] Created scraper for platform:", {
          platform,
        });

        const cleanHandle = handle.replaceAll("@", "");
        console.log("[DEBUG] Processing platform:", {
          platform,
          handle,
        });

        const { socials, error: socialError } = await createSocials([
          {
            username: cleanHandle,
            profile_url: getProfileUrl(platform, handle),
          },
        ]);

        if (socialError || !socials.length) {
          console.error("[ERROR] Failed to create social record:", {
            platform,
            handle,
            error: socialError?.message || "No social created",
          });
          return;
        }

        const existingSocial = socials[0];

        console.log("[DEBUG] Created social record:", {
          platform,
          socialId: existingSocial.id,
        });

        console.log("[DEBUG] Creating agent status:", {
          agentId,
          socialId: existingSocial.id,
        });

        const { agent_status } = await createAgentStatus(
          agentId,
          existingSocial.id,
          STEP_OF_AGENT.PROFILE
        );

        if (!agent_status?.id) {
          console.error("[ERROR] Failed to create agent status:", {
            agentId,
            socialId: existingSocial.id,
          });
          return;
        }

        console.log("[DEBUG] Created agent status:", {
          statusId: agent_status.id,
          status: STEP_OF_AGENT[STEP_OF_AGENT.PROFILE],
        });

        console.log("[DEBUG] Scraping profile:", {
          platform,
          handle,
        });

        const profile = await scraper.scrapeProfile(cleanHandle);
        console.log("[DEBUG] Profile scraped successfully:", {
          platform,
          username: profile.username,
          profileFields: Object.keys(profile),
        });

        await updateAgentStatus(
          agent_status.id,
          STEP_OF_AGENT.SETTING_UP_ARTIST
        );

        const { error: setupError } = await this.agentService.setupArtist({
          artistId,
          social: existingSocial,
          profile,
        });
        if (setupError) {
          throw setupError;
        }

        console.log("[DEBUG] Fetching posts:", {
          platform,
          handle,
        });

        await updateAgentStatus(agent_status.id, STEP_OF_AGENT.POSTURLS);
        const posts = await scraper.scrapePosts(cleanHandle);

        console.log("[DEBUG] Posts fetched successfully:", {
          platform,
          postCount: posts.length,
        });

        const { data: stored_posts, error: postsError } =
          await this.agentService.storePosts({
            socialId: existingSocial.id,
            posts,
          });

        if (postsError || !stored_posts) {
          await updateAgentStatus(agent_status.id, STEP_OF_AGENT.MISSING_POSTS);
          throw postsError || new Error("Failed to store posts");
        }

        console.log("[DEBUG] Fetching comments for posts:", {
          platform,
          postCount: posts.length,
        });

        await updateAgentStatus(agent_status.id, STEP_OF_AGENT.POST_COMMENTS);
        const comments = await scraper.scrapeComments(
          posts.map((p) => p.post_url)
        );

        console.log("[DEBUG] Comments fetched successfully:", {
          platform,
          commentCount: comments.length,
        });

        // Create initial social records for comment authors
        const socialMap = await this.createInitialCommentSocials(comments);

        // Store comments with initial social IDs
        await this.agentService.storeComments({
          social: existingSocial,
          comments,
          posts: stored_posts,
          socialMap,
        });

        // Enhance social records with additional data
        const enhancedProfiles = await this.enhanceCommentSocials(comments);

        // Process fan posts if available - now passing socialMap
        await this.processFanPosts(
          enhancedProfiles,
          agent_status.id,
          socialMap
        );

        console.log("[INFO] Platform processing completed successfully:", {
          platform,
          statusId: agent_status.id,
        });

        await updateAgentStatus(agent_status.id, STEP_OF_AGENT.FINISHED);
      } catch (error) {
        console.error("[ERROR] Platform processing failed:", {
          platform,
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                }
              : String(error),
        });
        // Don't throw here - we want to continue with other platforms
      }
    };

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

    console.log("[DEBUG] Starting parallel platform processing:", {
      agentId,
      platformCount: tasks.length,
    });

    await Promise.all(tasks);

    console.log("[DEBUG] All platform processing tasks completed:", {
      agentId,
    });

    if ((await areAllPlatformsComplete(agentId)) && artistId) {
      console.log("[INFO] Starting segment generation:", {
        agentId,
        artistId,
      });

      try {
        await updateAllAgentStatuses(agentId, STEP_OF_AGENT.SEGMENTS);
        await generateSegmentsForAccount(artistId);
        await updateAllAgentStatuses(agentId, STEP_OF_AGENT.FINISHED);

        console.log("[INFO] Segment generation completed successfully:", {
          agentId,
          artistId,
        });
      } catch (error) {
        console.error("[ERROR] Segment generation failed:", {
          agentId,
          artistId,
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                }
              : String(error),
        });
        await updateAllAgentStatuses(agentId, STEP_OF_AGENT.FINISHED);
      }
    }
  }
}
