import { Database } from "./database.types";

type DbSocial = Database["public"]["Tables"]["socials"]["Row"];

export interface SocialProfile
  extends Pick<
    DbSocial,
    | "id"
    | "username"
    | "profile_url"
    | "avatar"
    | "bio"
    | "region"
    | "updated_at"
  > {
  follower_count: DbSocial["followerCount"];
  following_count: DbSocial["followingCount"];
  post_count: number | null;
}

export interface ArtistProfile {
  id: string;
  profiles: SocialProfile[];
  total_followers: number;
  total_following: number;
  total_posts: number;
  updated_at: string;
}

export interface ArtistProfileResponse {
  status: string;
  profile: ArtistProfile | null;
  error?: string;
}
