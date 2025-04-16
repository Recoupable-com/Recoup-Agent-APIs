import { Database } from "./database.types";

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Social = Database["public"]["Tables"]["socials"]["Row"];
export type SocialPost = Database["public"]["Tables"]["social_posts"]["Row"];
export type Agent = Database["public"]["Tables"]["agents"]["Row"];
export type Account_Social =
  Database["public"]["Tables"]["account_socials"]["Row"];
export type Comment = Database["public"]["Tables"]["post_comments"]["Row"];

export type ScrapedComment = {
  comment: string | null;
  username: string;
  commented_at: string;
  post_id: string;
  profile_url: string;
};

export interface AuthorInput {
  username: string;
  profile_url: string;
}

export interface EnhancedSocial extends Social {
  postUrls?: string[];
}

export interface EnhanceProfilesResult {
  enhancedProfiles: EnhancedSocial[];
}
