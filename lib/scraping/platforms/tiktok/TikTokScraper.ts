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
    console.log("TikTokScraper.scrapeComments: Scraping comments", {
      postUrls,
    });
    try {
      // Validate input
      if (!Array.isArray(postUrls) || !postUrls.length) {
        console.warn("TikTokScraper.scrapeComments: No post URLs provided");
        return [];
      }

      // Create post objects for formatting
      const posts = postUrls.map((url) => ({
        post_url: url,
        id: url, // Use URL as temporary ID for matching
        updated_at: new Date().toISOString(),
      }));

      // Get comments using the proper flow
      console.debug("TikTokScraper.scrapeComments: Fetching comments", {
        postCount: posts.length,
      });

      const comments = await getVideoComments("", posts);

      if (!comments?.length) {
        console.debug("TikTokScraper.scrapeComments: No comments found");
        return [];
      }

      return comments;
    } catch (error) {
      return this.handleError(error, "TikTokScraper.scrapeComments");
    }
  }
}
