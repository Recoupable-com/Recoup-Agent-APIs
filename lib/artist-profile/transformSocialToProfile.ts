import { Social } from "../../types/agent";
import { SocialProfile } from "../../types/artistProfile.types";

/**
 * Transforms a Social entity into a SocialProfile format
 * @param social The social entity from the database
 * @param postCount Optional count of posts for this social profile
 * @returns A formatted SocialProfile object
 */
export const transformSocialToProfile = (
  social: Social,
  postCount: number = 0
): SocialProfile => ({
  id: social.id,
  username: social.username || "",
  profile_url: social.profile_url,
  avatar: social.avatar,
  bio: social.bio,
  follower_count: social.followerCount,
  following_count: social.followingCount,
  post_count: postCount,
  region: social.region,
  updated_at: social.updated_at,
});
