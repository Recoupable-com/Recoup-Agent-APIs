import { EnhancedSocial } from "../../types/agent";
import { ScrapedPost } from "../scraping/types";
import { AgentService } from "../services/AgentService";
import getSocialPlatformByLink from "../getSocialPlatformByLink";
import { isValidPlatform } from "../utils/validatePlatform";

/**
 * Process and store posts from fan profiles
 */
const processFanPosts = async (
  enhancedProfiles: EnhancedSocial[],
  agentStatusId: string,
  socialMap: { [username: string]: string }
): Promise<void> => {
  const agentService = new AgentService();

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
      const { error: postsError } = await agentService.storePosts({
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
};

export default processFanPosts;
