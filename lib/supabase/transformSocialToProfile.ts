import { Social } from "../../types/agent";
import { SocialProfile } from "../../types/artistProfile.types";

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
