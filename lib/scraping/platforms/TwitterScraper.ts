import { BaseScraper } from "../BaseScraper";
import {
  ScrapedProfile,
  ScrapedPost,
  ScrapedComment,
  ScrapingResult,
} from "../types";
import { Database } from "../../../types/database.types";
import getProfile from "../../twitter/getProfile";
import getAllTweets from "../../twitter/getAllTweets";
import getTwitterCommentsPosts from "../../twitter/getTwitterCommentsPosts";
import { Scraper } from "agent-twitter-client";

export class TwitterScraper extends BaseScraper {
  private scraper: any;

  constructor() {
    super();
    this.scraper = new Scraper();
  }

  async scrapeProfile(handle: string): Promise<ScrapedProfile> {
    console.log("TwitterScraper.scrapeProfile: Starting", { handle });
    try {
      const { profile } = await getProfile(this.scraper, handle);
      console.log("TwitterScraper.scrapeProfile: Got profile", {
        hasProfile: !!profile,
        avatar: profile?.avatar?.substring(0, 50),
        followerCount: profile?.followerCount,
      });

      if (!profile) {
        throw new Error("Profile not found");
      }

      return {
        username: handle,
        profile_url: `https://x.com/${handle}`,
        avatar: profile.avatar,
        followerCount: profile.followerCount,
        description: profile.bio,
      };
    } catch (error) {
      console.error("TwitterScraper.scrapeProfile: Failed", {
        handle,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async scrapePosts(handle: string): Promise<ScrapedPost[]> {
    console.log("TwitterScraper.scrapePosts: Starting", { handle });
    try {
      console.log("TwitterScraper.scrapePosts: Getting tweets");
      const tweets = await getAllTweets(this.scraper, handle);
      console.log("TwitterScraper.scrapePosts: Got tweets", {
        tweetCount: tweets?.length,
      });

      console.log("TwitterScraper.scrapePosts: Processing tweets");
      const { comments, postUrls } = getTwitterCommentsPosts(tweets);
      console.log("TwitterScraper.scrapePosts: Processed tweets", {
        commentCount: comments?.length,
        postUrlCount: postUrls?.length,
      });

      if (!postUrls?.length) {
        console.warn("TwitterScraper.scrapePosts: No posts found", { handle });
        return [];
      }

      const posts = postUrls.map((url: string) => ({
        post_url: url,
        platform: "TWITTER" as Database["public"]["Enums"]["social_type"],
        created_at: new Date().toISOString(),
      }));

      console.log("TwitterScraper.scrapePosts: Returning posts", {
        postCount: posts.length,
        firstPostUrl: posts[0]?.post_url,
        lastPostUrl: posts[posts.length - 1]?.post_url,
      });

      return posts;
    } catch (error) {
      console.error("TwitterScraper.scrapePosts: Failed", {
        handle,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async scrapeComments(postUrls: string[]): Promise<ScrapedComment[]> {
    console.log("TwitterScraper.scrapeComments: Starting", {
      postUrlCount: postUrls?.length,
    });
    try {
      if (!postUrls?.length) {
        console.warn("TwitterScraper.scrapeComments: No post URLs provided");
        return [];
      }

      const handle = postUrls[0].split("/")[3];
      console.log("TwitterScraper.scrapeComments: Getting tweets", { handle });
      const tweets = await getAllTweets(this.scraper, handle);
      console.log("TwitterScraper.scrapeComments: Got tweets", {
        tweetCount: tweets?.length,
      });

      console.log("TwitterScraper.scrapeComments: Processing tweets");
      const { comments } = getTwitterCommentsPosts(tweets);
      console.log("TwitterScraper.scrapeComments: Processed tweets", {
        commentCount: comments?.length,
      });

      if (!comments?.length) {
        console.warn("TwitterScraper.scrapeComments: No comments found", {
          handle,
          postUrlCount: postUrls.length,
        });
        return [];
      }

      console.log("TwitterScraper.scrapeComments: Returning comments", {
        commentCount: comments.length,
        firstCommentUrl: comments[0]?.post_url,
        lastCommentUrl: comments[comments.length - 1]?.post_url,
      });

      return comments;
    } catch (error) {
      console.error("TwitterScraper.scrapeComments: Failed", {
        postUrlCount: postUrls?.length,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async scrapeAll(handle: string): Promise<ScrapingResult> {
    console.log("TwitterScraper.scrapeAll: Starting full scrape", { handle });
    try {
      const profile = await this.scrapeProfile(handle);
      const posts = await this.scrapePosts(handle);
      const comments = await this.scrapeComments(posts.map((p) => p.post_url));

      return {
        profile,
        posts,
        comments,
      };
    } catch (error) {
      console.error(
        "TwitterScraper.scrapeAll: Failed to complete scrape",
        error
      );
      throw error;
    }
  }
}
