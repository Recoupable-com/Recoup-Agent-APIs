import { BaseScraper } from "../BaseScraper";
import { ScrapedProfile, ScrapedPost, ScrapedComment } from "../types";
import { Database } from "../../../types/database.types";
import getProfile from "../../instagram/getProfile";
import getPostComments from "../../instagram/getPostComments";

export class InstagramScraper extends BaseScraper {
  async scrapeProfile(handle: string): Promise<ScrapedProfile> {
    console.log("InstagramScraper.scrapeProfile: Scraping profile", { handle });
    try {
      const { profile } = await getProfile(handle);

      if (!profile) {
        throw new Error("Profile not found");
      }

      return {
        username: handle,
        profile_url: `https://instagram.com/${handle}`,
        avatar: profile.avatar,
        followerCount: profile.followerCount,
        followingCount: profile.followingCount,
        description: profile.bio,
      };
    } catch (error) {
      return this.handleError(error, "InstagramScraper.scrapeProfile");
    }
  }

  async scrapePosts(handle: string): Promise<ScrapedPost[]> {
    console.log("InstagramScraper.scrapePosts: Scraping posts", { handle });
    try {
      const { postUrls } = await getProfile(handle);

      if (!postUrls?.length) {
        return [];
      }

      return postUrls.map((url: string) => ({
        post_url: url,
        platform: "INSTAGRAM" as Database["public"]["Enums"]["social_type"],
        created_at: new Date().toISOString(), // Instagram API doesn't provide post date in initial fetch
      }));
    } catch (error) {
      return this.handleError(error, "InstagramScraper.scrapePosts");
    }
  }

  async scrapeComments(postUrls: string[]): Promise<ScrapedComment[]> {
    console.log("InstagramScraper.scrapeComments: Scraping comments", {
      postUrls,
    });
    try {
      // Validate input
      if (!Array.isArray(postUrls) || !postUrls.length) {
        console.warn("InstagramScraper.scrapeComments: No post URLs provided");
        return [];
      }

      // Create post objects for formatting
      const posts = postUrls.map((url) => ({
        post_url: url,
        id: url, // Use URL as temporary ID for matching
        updated_at: new Date().toISOString(),
      }));

      // Get comments using the proper flow
      console.debug("InstagramScraper.scrapeComments: Fetching comments", {
        postCount: posts.length,
      });

      const comments = await getPostComments(posts);

      if (!comments?.length) {
        console.debug("InstagramScraper.scrapeComments: No comments found");
        return [];
      }

      return comments;
    } catch (error) {
      return this.handleError(error, "InstagramScraper.scrapeComments");
    }
  }
}
