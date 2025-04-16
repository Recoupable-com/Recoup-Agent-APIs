import supabase from "./serverClient";
import { getArtistPosts } from "./getArtistPosts";

interface GetArtistCommentsParams {
  artist_account_id: string;
  post_id?: string;
  page?: number;
  limit?: number;
}

const CHUNK_SIZE = 100; // Supabase has limitations on IN clause size

const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const getArtistComments = async ({
  artist_account_id,
  post_id,
  page = 1,
  limit = 10,
}: GetArtistCommentsParams) => {
  try {
    console.log("[DEBUG] getArtistComments called with params:", {
      artist_account_id,
      post_id,
      page,
      limit,
    });

    const offset = (page - 1) * limit;

    // Get post IDs - either from specific post_id or from all artist's posts
    let postIds: string[] = [];
    if (post_id) {
      postIds = [post_id];
      console.log("[DEBUG] Using provided post_id:", post_id);
    } else {
      // Get all posts for the artist by paginating through results
      console.log("[DEBUG] Getting all posts for artist");
      let currentPage = 1;
      let hasMore = true;
      const POSTS_PER_PAGE = 100; // Fetch maximum posts per page

      while (hasMore) {
        console.log("[DEBUG] Fetching posts page:", currentPage);
        const postsResponse = await getArtistPosts(artist_account_id, {
          page: currentPage,
          limit: POSTS_PER_PAGE,
        });

        // Add post IDs from this page
        postIds.push(...postsResponse.posts.map((post) => post.id));

        // Check if we need to fetch more pages
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
    }

    if (!postIds.length) {
      console.log("[DEBUG] No posts found");
      return {
        status: "success",
        data: {
          comments: [],
          pagination: {
            current_page: page,
            total_pages: 0,
            total_comments: 0,
            per_page: limit,
          },
        },
      };
    }

    // Get total count of comments by chunking post IDs
    console.log("[DEBUG] Getting total comment count");
    let totalCount = 0;
    const postIdChunks = chunkArray(postIds, CHUNK_SIZE);

    for (const chunk of postIdChunks) {
      const { count } = await supabase
        .from("post_comments")
        .select("*", { count: "exact", head: true })
        .in("post_id", chunk);

      if (count) {
        totalCount += count;
      }
    }

    console.log("[DEBUG] Total comments found:", totalCount);

    if (!totalCount) {
      console.log("[DEBUG] No comments found");
      return {
        status: "success",
        data: {
          comments: [],
          pagination: {
            current_page: page,
            total_pages: 0,
            total_comments: 0,
            per_page: limit,
          },
        },
      };
    }

    // Get paginated comments by chunking post IDs and combining results
    console.log("[DEBUG] Getting paginated comments");
    let allComments = [];
    const startChunk = Math.floor(offset / CHUNK_SIZE);
    const endChunk = Math.floor((offset + limit) / CHUNK_SIZE);

    for (let i = startChunk; i <= endChunk && i < postIdChunks.length; i++) {
      const chunk = postIdChunks[i];
      const { data: chunkComments, error } = await supabase
        .from("post_comments")
        .select("id, post_id, social_id, comment, commented_at")
        .in("post_id", chunk)
        .order("commented_at", { ascending: false });

      if (error) {
        console.error("[ERROR] Failed to get comments for chunk:", error);
        throw error;
      }

      if (chunkComments) {
        allComments.push(...chunkComments);
      }
    }

    // Apply offset and limit to the combined results
    const startIndex = offset % CHUNK_SIZE;
    const comments = allComments.slice(startIndex, startIndex + limit);

    const total_comments = totalCount;
    const total_pages = Math.ceil(total_comments / limit);

    const response = {
      status: "success",
      data: {
        comments: comments || [],
        pagination: {
          current_page: page,
          total_pages,
          total_comments,
          per_page: limit,
        },
      },
    };

    console.log("[DEBUG] Returning response:", {
      commentCount: comments?.length || 0,
      total_comments,
      total_pages,
      current_page: page,
    });

    return response;
  } catch (error) {
    console.error("[ERROR] Error in getArtistComments:", error);
    throw error;
  }
};
