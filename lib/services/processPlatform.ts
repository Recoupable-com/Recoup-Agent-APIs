import { Database } from "../../types/database.types";
import { STEP_OF_AGENT } from "../step";
import { ScraperFactory } from "../scraping/ScraperFactory";
import { AgentService } from "./AgentService";
import createSocials from "../supabase/createSocials";
import { getProfileUrl } from "../utils/getProfileUrl";
import createAgentStatus from "../supabase/createAgentStatus";
import updateAgentStatus from "../supabase/updateAgentStatus";
import createCommentSocials from "../supabase/createCommentSocials";
import enhanceCommentSocials from "../supabase/enhanceCommentSocials";
import processFanPosts from "../supabase/processFanPosts";

type SocialType = Database["public"]["Enums"]["social_type"];

/**
 * Process a single platform for an agent
 */
const processPlatform = async (
  agentId: string,
  platform: SocialType,
  handle: string,
  artistId?: string
): Promise<void> => {
  const agentService = new AgentService();

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

    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.SETTING_UP_ARTIST);

    const { error: setupError } = await agentService.setupArtist({
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
      await agentService.storePosts({
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
    const comments = await scraper.scrapeComments(posts.map((p) => p.post_url));

    console.log("[DEBUG] Comments fetched successfully:", {
      platform,
      commentCount: comments.length,
    });

    // Create initial social records for comment authors
    const socialMap = await createCommentSocials(comments);

    // Store comments with initial social IDs
    await agentService.storeComments({
      social: existingSocial,
      comments,
      posts: stored_posts,
      socialMap,
    });

    // Enhance social records with additional data
    const enhancedProfiles = await enhanceCommentSocials(comments);

    // Process fan posts if available
    await processFanPosts(enhancedProfiles, agent_status.id, socialMap);

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

export default processPlatform;
