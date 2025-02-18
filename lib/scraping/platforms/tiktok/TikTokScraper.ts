import { BaseScraper } from "../../BaseScraper";
import { ScrapedProfile, ScrapedPost, ScrapedComment } from "../../types";
import { Database } from "../../../../types/database.types";
import getProfile from "../../../tiktok/getProfile";
import getVideoComments from "../../../tiktok/getVideoComments";

export class TikTokScraper extends BaseScraper {
  async scrapeProfile(handle: string): Promise<ScrapedProfile> {
    console.log("TikTokScraper.scrapeProfile: Scraping profile", { handle });
    try {
      const { profile } = await getProfile(handle);

      if (!profile) {
        throw new Error("Profile not found");
      }

      return {
        username: handle,
        profile_url: `https://tiktok.com/@${handle}`,
        avatar: profile.avatar || undefined,
        followerCount: profile.followerCount || undefined,
        description: profile.bio || undefined,
      };
    } catch (error) {
      return this.handleError(error, "TikTokScraper.scrapeProfile");
    }
  }

  async scrapePosts(handle: string): Promise<ScrapedPost[]> {
    console.log("TikTokScraper.scrapePosts: Scraping posts", { handle });
    try {
      const { videoUrls } = await getProfile(handle);

      if (!videoUrls?.length) {
        console.debug("TikTokScraper.scrapePosts: No posts found");
        return [];
      }

      return videoUrls.map((url) => ({
        post_url: url,
        platform: "tiktok" as Database["public"]["Enums"]["social_type"],
        created_at: new Date().toISOString(), // TikTok API doesn't provide this directly
        media_type: "video",
      }));
    } catch (error) {
      return this.handleError(error, "TikTokScraper.scrapePosts");
    }
  }

  async scrapeComments(postUrls: string[]): Promise<ScrapedComment[]> {
    console.log("[TikTokScraper.scrapeComments] Starting comment scraping", {
      postCount: postUrls.length,
      postUrls: postUrls,
    });
    try {
      // Validate input
      if (!Array.isArray(postUrls) || !postUrls.length) {
        console.warn("[TikTokScraper.scrapeComments] No post URLs provided");
        return [];
      }

      // Create post objects for formatting
      const posts = postUrls.map((url) => ({
        post_url: url,
        id: url, // Use URL as temporary ID for matching
        updated_at: new Date().toISOString(),
      }));

      // Get comments using the proper flow
      console.log(
        "[TikTokScraper.scrapeComments] Fetching comments via getVideoComments",
        {
          postCount: posts.length,
          samplePost: posts[0],
        }
      );

      const comments = await getVideoComments(posts);

      console.log(
        "[TikTokScraper.scrapeComments] Received comments from getVideoComments",
        {
          commentCount: comments?.length || 0,
          sampleComment: comments?.[0],
          hasComments: !!comments?.length,
        }
      );

      if (!comments?.length) {
        console.warn(
          "[TikTokScraper.scrapeComments] No comments found for any posts"
        );
        return [];
      }

      // Validate comment structure before returning
      const validComments = comments.filter((comment: ScrapedComment) => {
        const isValid =
          (comment?.post_url || comment?.post_id) && // Accept either post_url or post_id
          comment?.comment &&
          comment?.username &&
          comment?.commented_at;
        if (!isValid) {
          console.warn(
            "[TikTokScraper.scrapeComments] Found invalid comment:",
            comment
          );
        }

        // If we have post_id but not post_url, map it
        if (isValid && !comment.post_url && comment.post_id) {
          comment.post_url = comment.post_id;
        }

        return isValid;
      });

      console.log(
        "[TikTokScraper.scrapeComments] Returning validated comments",
        {
          originalCount: comments.length,
          validCount: validComments.length,
          sampleValidComment: validComments[0],
        }
      );

      return validComments;
    } catch (error) {
      return this.handleError(error, "TikTokScraper.scrapeComments");
    }
  }
}
