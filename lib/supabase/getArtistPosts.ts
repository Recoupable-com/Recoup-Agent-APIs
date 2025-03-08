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
    const { status, socials } = await getAccountSocials(artistAccountId);

    if (status !== "success" || !socials.length) {
      return {
        status: "success",
        posts: [],
        pagination: createEmptyPagination(),
      };
    }

    const socialIds = socials.map((social) => social.id);

    const allSocialPosts = await getSocialPostsByIds(socialIds);

    if (!allSocialPosts.length) {
      return {
        status: "success",
        posts: [],
        pagination: createEmptyPagination(),
      };
    }

    const uniquePostIds = [
      ...new Set(allSocialPosts.map((sp) => sp.post_id).filter(Boolean)),
    ];

    const total = uniquePostIds.length;
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    const paginatedPostIds = uniquePostIds.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    const allPosts = await getPostsByIds(paginatedPostIds);

    if (allPosts.length === 0) {
      return {
        status: "success",
        posts: [],
        pagination: createEmptyPagination(),
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
