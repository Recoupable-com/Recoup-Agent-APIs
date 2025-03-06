import { BaseScraper } from "../../BaseScraper";
import { ScrapedProfile, ScrapedPost, ScrapedComment } from "../../types";
import { Database } from "../../../../types/database.types";
import getProfile from "../../../twitter/getProfile";
import { Scraper, Tweet } from "agent-twitter-client";
import { getAllTweets } from "../../../twitter/getAllTweets";

const scraper = new Scraper();

export class TwitterScraper extends BaseScraper {
  async scrapeProfile(handle: string): Promise<ScrapedProfile> {
    try {
      const { profile } = await getProfile(scraper, handle);

      if (!profile) {
        throw new Error("Profile not found");
      }

      return profile;
    } catch (error) {
      return this.handleError(error, "TikTokScraper.scrapeProfile");
    }
  }

  async scrapePosts(handle: string): Promise<ScrapedPost[]> {
    try {
      const allTweets = await getAllTweets(scraper, handle);
      if (!allTweets?.length) {
        return [];
      }

      return allTweets.map((tweet: Tweet) => ({
        post_url: tweet.permanentUrl || "",
        platform: "twitter" as Database["public"]["Enums"]["social_type"],
        created_at: tweet.timestamp
          ? new Date(tweet.timestamp).toISOString()
          : new Date().toISOString(),
        media_type: "post",
        content: tweet.text || "",
        media_url: tweet.photos[0]?.url || tweet.videos[0]?.url || "",
      }));
    } catch (error) {
      return this.handleError(error, "TikTokScraper.scrapePosts");
    }
  }

  async scrapeComments(postUrls: string[]): Promise<ScrapedComment[]> {
    try {
      return [];
    } catch (error) {
      return this.handleError(error, "TikTokScraper.scrapeComments");
    }
  }
}
