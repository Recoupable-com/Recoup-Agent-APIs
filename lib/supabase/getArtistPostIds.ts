import { getArtistPosts } from "./getArtistPosts";

interface GetArtistPostIdsParams {
  artist_account_id: string;
  post_id?: string;
}

/**
 * Gets all post IDs for an artist, or returns a single post ID if provided
 */
export const getArtistPostIds = async ({
  artist_account_id,
  post_id,
}: GetArtistPostIdsParams): Promise<string[]> => {
  if (post_id) {
    console.log("[DEBUG] Using provided post_id:", post_id);
    return [post_id];
  }

  // Get all posts for the artist by paginating through results
  console.log("[DEBUG] Getting all posts for artist");
  const postIds: string[] = [];
  let currentPage = 1;
  let hasMore = true;
  const POSTS_PER_PAGE = 100;

  while (hasMore) {
    console.log("[DEBUG] Fetching posts page:", currentPage);
    const postsResponse = await getArtistPosts(artist_account_id, {
      page: currentPage,
      limit: POSTS_PER_PAGE,
    });

    postIds.push(...postsResponse.posts.map((post) => post.id));
    hasMore = postsResponse.pagination.hasMore;
    currentPage++;

    console.log("[DEBUG] Posts page fetched:", {
      pagePostCount: postsResponse.posts.length,
      totalPostsSoFar: postIds.length,
      hasMore,
    });
  }

  console.log("[DEBUG] Finished fetching all posts:", {
    totalPosts: postIds.length,
  });

  return postIds;
};

export default getArtistPostIds;
