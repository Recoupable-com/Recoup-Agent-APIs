import { BaseScraper } from "../../BaseScraper";
import { ScrapedProfile, ScrapedPost, ScrapedComment } from "../../types";
import getProfile from "../../../tiktok/getProfile";
import getVideoComments from "../../../tiktok/getVideoComments";
import { SocialType } from "../../../../types/agent";

export class TikTokScraper extends BaseScraper {
  async scrapeProfile(handle: string): Promise<ScrapedProfile> {
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
    try {
      const { videoUrls } = await getProfile(handle);

      if (!videoUrls?.length) {
        return [];
      }

      return videoUrls.map((url) => ({
        post_url: url,
        platform: "tiktok" as SocialType,
        created_at: new Date().toISOString(),
        media_type: "video",
      }));
    } catch (error) {
      return this.handleError(error, "TikTokScraper.scrapePosts");
    }
  }

  async scrapeComments(postUrls: string[]): Promise<ScrapedComment[]> {
    try {
      if (!Array.isArray(postUrls) || !postUrls.length) {
        return [];
      }

      const posts = postUrls.map((url) => ({
        post_url: url,
        id: url,
        updated_at: new Date().toISOString(),
      }));

      const comments = await getVideoComments(posts);

      if (!comments?.length) {
        return [];
      }

      const validComments = comments.filter((comment: ScrapedComment) => {
        const isValid =
          (comment?.post_url || comment?.post_id) &&
          comment?.comment &&
          comment?.username &&
          comment?.commented_at;

        if (isValid && !comment.post_url && comment.post_id) {
          comment.post_url = comment.post_id;
        }

        return isValid;
      });

      return validComments;
    } catch (error) {
      return this.handleError(error, "TikTokScraper.scrapeComments");
    }
  }
}
