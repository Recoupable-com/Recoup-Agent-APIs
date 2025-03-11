import { BaseScraper } from "../BaseScraper";
import { ScrapedProfile, ScrapedPost, ScrapedComment } from "../types";
import { Database } from "../../../types/database.types";
import { getProfiles } from "../../instagram/getProfiles";
import getPostComments from "../../instagram/getPostComments";

export class InstagramScraper extends BaseScraper {
  async scrapeProfile(handle: string): Promise<ScrapedProfile> {
    console.log("InstagramScraper.scrapeProfile: Scraping profile", { handle });
    try {
      const { profiles, errors } = await getProfiles([handle]);

      if (errors[handle]) {
        throw errors[handle];
      }

      if (!profiles.length) {
        throw new Error(`Profile not found for handle: ${handle}`);
      }

      const profile = profiles[0];

      return {
        username: handle,
        profile_url: `https://instagram.com/${handle}`,
        avatar: profile.avatar || undefined,
        followerCount: profile.followerCount || undefined,
        followingCount: profile.followingCount || undefined,
        description: profile.bio || undefined,
      };
    } catch (error) {
      return this.handleError(error, "InstagramScraper.scrapeProfile");
    }
  }

  async scrapePosts(handle: string): Promise<ScrapedPost[]> {
    try {
      const { profiles, errors } = await getProfiles([handle]);

      if (errors[handle]) {
        throw errors[handle];
      }

      if (!profiles.length) {
        throw new Error(`Profile not found for handle: ${handle}`);
      }

      const profile = profiles[0];
      const postUrls = profile.postUrls || [];

      if (!postUrls.length) {
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
      if (!Array.isArray(postUrls) || !postUrls.length) {
        console.warn("InstagramScraper.scrapeComments: No post URLs provided");
        return [];
      }

      const posts = postUrls.map((url) => ({
        post_url: url,
        id: url, // Use URL as temporary ID for matching
        updated_at: new Date().toISOString(),
      }));

      const comments = await getPostComments(posts);

      if (!comments?.length) {
        return [];
      }

      return comments;
    } catch (error) {
      return this.handleError(error, "InstagramScraper.scrapeComments");
    }
  }
}
