import { Social, Post, Comment, SocialType } from "../../types/agent";

/**
 * Represents a social profile as scraped from a platform.
 * Maps to the 'socials' table in the database.
 */
export interface ScrapedProfile {
  username: string;
  profile_url: string;
  avatar?: string;
  followerCount?: number;
  description?: string;
}

/**
 * Represents a post as scraped from a platform.
 * Maps to the 'posts' table in the database.
 */
export interface ScrapedPost {
  post_url: string;
  platform: SocialType;
  created_at?: string;
  content?: string;
  media_type?: string;
  media_url?: string;
}

/**
 * Represents a comment as scraped from a platform.
 * Maps to the 'post_comments' table in the database.
 */
export interface ScrapedComment {
  post_url: string;
  post_id?: string; // Optional post_id field for TikTok API responses
  comment: string;
  username: string;
  profile_url: string;
  commented_at: string;
}

export interface ScrapingResult {
  profile: ScrapedProfile;
  posts: ScrapedPost[];
  comments: ScrapedComment[];
}

/**
 * Interface for platform-specific scrapers.
 * Each platform (Instagram, Twitter, TikTok) will implement this interface.
 */
export interface SocialScraper {
  scrapeProfile(handle: string): Promise<ScrapedProfile>;
  scrapePosts(handle: string): Promise<ScrapedPost[]>;
  scrapeComments(postUrls: string[]): Promise<ScrapedComment[]>;
  scrapeAll(handle: string): Promise<ScrapingResult>;
}

/**
 * Helper type to convert scraped data to database format
 */
export interface DatabaseMapper {
  toDbSocial(profile: ScrapedProfile): Omit<Social, "id" | "updated_at">;
  toDbPost(post: ScrapedPost): Omit<Post, "id" | "updated_at">;
  toDbComment(
    comment: ScrapedComment,
    postId: string,
    socialId: string
  ): Omit<Comment, "id">;
}
