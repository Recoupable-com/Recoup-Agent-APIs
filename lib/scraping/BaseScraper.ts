import {
  ScrapedProfile,
  ScrapedPost,
  ScrapedComment,
  ScrapingResult,
  SocialScraper,
} from "./types";

/**
 * Base class for social media scrapers.
 * Implements common functionality and enforces the SocialScraper interface.
 */
export abstract class BaseScraper implements SocialScraper {
  /**
   * Platform-specific implementation to scrape a user's profile
   */
  abstract scrapeProfile(handle: string): Promise<ScrapedProfile>;

  /**
   * Platform-specific implementation to scrape posts
   */
  abstract scrapePosts(handle: string): Promise<ScrapedPost[]>;

  /**
   * Platform-specific implementation to scrape comments
   */
  abstract scrapeComments(postUrls: string[]): Promise<ScrapedComment[]>;

  /**
   * Common implementation of scrapeAll that coordinates the scraping process.
   * Can be overridden by platform-specific implementations if needed.
   */
  async scrapeAll(handle: string): Promise<ScrapingResult> {
    // Get profile first
    const profile = await this.scrapeProfile(handle);

    // Get posts
    const posts = await this.scrapePosts(handle);

    // Get comments for all posts
    const postUrls = posts.map((post) => post.post_url);
    const comments = await this.scrapeComments(postUrls);

    return {
      profile,
      posts,
      comments,
    };
  }

  /**
   * Helper method to handle errors consistently across all scrapers
   */
  protected handleError(error: unknown, context: string): never {
    console.error(`Error in ${context}:`, error);
    throw new Error(
      `Scraping failed in ${context}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
