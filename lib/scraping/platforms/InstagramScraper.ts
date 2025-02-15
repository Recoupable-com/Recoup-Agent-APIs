import { BaseScraper } from "../BaseScraper";
import { ScrapedProfile, ScrapedPost, ScrapedComment } from "../types";
import { Database } from "../../../types/database.types";
import getProfile from "../../instagram/getProfile";
import getPostComments from "../../instagram/getPostComments";
import getPostCommentsDatasetId from "../../instagram/getPostCommentsDatasetId";
import getFormattedComments from "../../instagram/getFormattedComments";

type InstagramComment = {
  post_url: string;
  comment: string | null;
  username: string;
  profile_url: string;
  commented_at: string;
};

export class InstagramScraper extends BaseScraper {
  async scrapeProfile(handle: string): Promise<ScrapedProfile> {
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
        description: profile.bio,
      };
    } catch (error) {
      return this.handleError(error, "InstagramScraper.scrapeProfile");
    }
  }

  async scrapePosts(handle: string): Promise<ScrapedPost[]> {
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
    try {
      // First get dataset ID for scraping comments
      const datasetId = await getPostCommentsDatasetId(postUrls);

      // Convert posts to format expected by getPostComments
      const scraping_posts = postUrls.map((post_url) => ({
        id: "", // Will be filled by the database
        post_url,
        updated_at: new Date().toISOString(),
      }));

      // Get comments using existing functionality
      const comments = await getPostComments("", scraping_posts);

      // Format comments to match our ScrapedComment interface
      return comments.map((comment: InstagramComment) => ({
        post_url: comment.post_url,
        comment: comment.comment || "",
        username: comment.username,
        profile_url: comment.profile_url,
        commented_at: comment.commented_at,
      }));
    } catch (error) {
      return this.handleError(error, "InstagramScraper.scrapeComments");
    }
  }
}
