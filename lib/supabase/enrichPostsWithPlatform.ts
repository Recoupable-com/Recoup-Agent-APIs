import type { Social, SocialPost, Post } from "../../types/agent";

/**
 * Enriches posts with platform information based on social account data
 * @param posts Array of posts to enrich
 * @param socialPosts Array of social_posts entries linking posts to socials
 * @param socials Array of social accounts
 * @returns Array of enriched posts with platform information
 */
export const enrichPostsWithPlatform = (
  posts: Post[],
  socialPosts: SocialPost[],
  socials: Social[]
): Post[] => {
  if (!posts.length) {
    return [];
  }

  const enrichedPosts = posts.map((post) => {
    const socialPost = socialPosts.find((sp) => sp.post_id === post.id);
    const social = socials.find((s) => s.id === socialPost?.social_id);

    let platform = "UNKNOWN";
    if (social?.profile_url.includes("instagram")) {
      platform = "INSTAGRAM";
    } else if (social?.profile_url.includes("tiktok")) {
      platform = "TIKTOK";
    } else if (
      social?.profile_url.includes("twitter") ||
      social?.profile_url.includes("x.com")
    ) {
      platform = "TWITTER";
    } else if (social?.profile_url.includes("spotify")) {
      platform = "SPOTIFY";
    }

    return {
      ...post,
      platform,
    };
  });

  return enrichedPosts;
};

export default enrichPostsWithPlatform;
