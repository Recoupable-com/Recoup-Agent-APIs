import getAccountSocials from "./getAccountSocials";
import getSocialPostsByIds from "./getSocialPostsByIds";
import getPostsByIds from "./getPostsByIds";
import enrichPostsWithPlatform from "./enrichPostsWithPlatform";
import { Post, SocialPost } from "../../types/agent";

interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface GetArtistPostsResponse {
  status: string;
  posts: Post[];
  pagination: PaginationMetadata;
}

interface PaginationOptions {
  limit?: number;
  page?: number;
}

/**
 * Gets all posts for an artist account across all social platforms
 * @param artistAccountId The artist account ID to get posts for
 * @param options Pagination options (limit and page)
 * @returns Object containing status, array of posts, and pagination metadata
 */
export const getArtistPosts = async (
  artistAccountId: string,
  options: PaginationOptions = {}
): Promise<GetArtistPostsResponse> => {
  const { limit = 20, page = 1 } = options;

  console.log("[DEBUG] getArtistPosts called with:", {
    artistAccountId,
    limit,
    page,
  });

  const createEmptyPagination = (): PaginationMetadata => ({
    total: 0,
    page,
    limit,
    hasMore: false,
  });

  const createErrorResponse = (status: string): GetArtistPostsResponse => ({
    status,
    posts: [],
    pagination: createEmptyPagination(),
  });

  try {
    console.log(
      "[DEBUG] Fetching account socials for artist:",
      artistAccountId
    );
    const { status, socials } = await getAccountSocials(artistAccountId);

    console.log("[DEBUG] getAccountSocials response:", {
      status,
      socialsCount: socials.length,
      socialIds: socials.map((s) => s.id),
    });

    if (status !== "success" || !socials.length) {
      console.log(
        "[DEBUG] No socials found for artist, returning empty response"
      );
      return {
        status: "success",
        posts: [],
        pagination: createEmptyPagination(),
      };
    }

    const socialIds = socials.map((social) => social.id);
    console.log("[DEBUG] Fetching social posts for socialIds:", socialIds);
    const allSocialPosts = await getSocialPostsByIds(socialIds);

    console.log("[DEBUG] getSocialPostsByIds response:", {
      socialPostsCount: allSocialPosts.length,
      uniqueSocialIds: [...new Set(allSocialPosts.map((sp) => sp.social_id))]
        .length,
    });

    if (!allSocialPosts.length) {
      console.log("[DEBUG] No social posts found, returning empty response");
      return {
        status: "success",
        posts: [],
        pagination: createEmptyPagination(),
      };
    }

    const uniquePostIds = [
      ...new Set(allSocialPosts.map((sp) => sp.post_id).filter(Boolean)),
    ];

    console.log("[DEBUG] Unique post IDs found:", {
      totalUniquePostIds: uniquePostIds.length,
      firstFewIds: uniquePostIds.slice(0, 5),
    });

    const total = uniquePostIds.length;
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    const paginatedPostIds = uniquePostIds.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    console.log("[DEBUG] Pagination calculation:", {
      total,
      startIndex,
      endIndex,
      paginatedPostIdsCount: paginatedPostIds.length,
      hasMore,
    });

    console.log(
      "[DEBUG] Fetching posts for paginatedPostIds:",
      paginatedPostIds
    );
    const allPosts = await getPostsByIds(paginatedPostIds);

    console.log("[DEBUG] getPostsByIds response:", {
      requestedPostsCount: paginatedPostIds.length,
      receivedPostsCount: allPosts.length,
      missingPostsCount: paginatedPostIds.length - allPosts.length,
    });

    if (allPosts.length === 0) {
      console.log("[DEBUG] No posts found, returning empty response");
      return {
        status: "success",
        posts: [],
        pagination: createEmptyPagination(),
      };
    }

    console.log("[DEBUG] Enriching posts with platform information");
    const enrichedPosts = enrichPostsWithPlatform(
      allPosts,
      allSocialPosts as SocialPost[],
      socials
    );

    console.log("[DEBUG] Final response:", {
      status: "success",
      postsCount: enrichedPosts.length,
      pagination: {
        total,
        page,
        limit,
        hasMore,
      },
    });

    return {
      status: "success",
      posts: enrichedPosts,
      pagination: {
        total,
        page,
        limit,
        hasMore,
      },
    };
  } catch (error) {
    console.error("[ERROR] Unexpected error in getArtistPosts:", error);
    return createErrorResponse("error");
  }
};

export default getArtistPosts;
