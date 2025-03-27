import { Social } from "../../types/agent";

interface ProfileMetrics {
  totalFollowers: number;
  totalFollowing: number;
  totalPosts: number;
  latestUpdate: Date;
}

export const calculateProfileMetrics = (
  socials: Social[],
  postCountMap: Record<string, number>
): ProfileMetrics => {
  let totalFollowers = 0;
  let totalFollowing = 0;
  let totalPosts = 0;
  let latestUpdate = new Date(0);

  socials.forEach((social) => {
    const postCount = postCountMap[social.id] || 0;
    const updatedAt = new Date(social.updated_at);

    if (updatedAt > latestUpdate) {
      latestUpdate = updatedAt;
    }

    totalFollowers += social.followerCount || 0;
    totalFollowing += social.followingCount || 0;
    totalPosts += postCount;
  });

  return {
    totalFollowers,
    totalFollowing,
    totalPosts,
    latestUpdate,
  };
};
