import getAccountSocials from "./getAccountSocials";
import getSocialPostsByIds from "./getSocialPostsByIds";
import getPostsByIds from "./getPostsByIds";
import enrichPostsWithPlatform from "./enrichPostsWithPlatform";
import { Post, SocialPost } from "../../types/agent";

interface GetArtistPostsResponse {
  status: string;
  posts: Post[];
}

/**
 * Gets all posts for an artist account across all social platforms
 * @param artistAccountId The artist account ID to get posts for
 * @returns Object containing status and array of posts
 */
export const getArtistPosts = async (
  artistAccountId: string
): Promise<GetArtistPostsResponse> => {
  try {
    const { status, socials } = await getAccountSocials(artistAccountId);

    if (status !== "success" || !socials.length) {
      return {
        status: "success",
        posts: [],
      };
    }

    const socialIds = socials.map((social) => social.id);

    const allSocialPosts = await getSocialPostsByIds(socialIds);

    if (!allSocialPosts.length) {
      return {
        status: "success",
        posts: [],
      };
    }

    const uniquePostIds = [
      ...new Set(allSocialPosts.map((sp) => sp.post_id).filter(Boolean)),
    ];

    const allPosts = await getPostsByIds(uniquePostIds);

    if (allPosts.length === 0) {
      return {
        status: "success",
        posts: [],
      };
    }

    const enrichedPosts = enrichPostsWithPlatform(
      allPosts,
      allSocialPosts as SocialPost[],
      socials
    );

    return {
      status: "success",
      posts: enrichedPosts,
    };
  } catch (error) {
    console.error("[ERROR] Unexpected error in getArtistPosts:", error);
    return {
      status: "error",
      posts: [],
    };
  }
};

export default getArtistPosts;
