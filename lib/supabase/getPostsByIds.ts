import supabase from "./serverClient";
import type { Post } from "../../types/agent";

/**
 * Fetches posts by IDs in chunks to avoid URL length limits
 * @param postIds Array of post IDs to fetch
 * @returns Array of posts
 */
export const getPostsByIds = async (postIds: string[]): Promise<Post[]> => {
  console.log("[DEBUG] getPostsByIds called with:", {
    postIdsCount: postIds.length,
    postIds,
  });

  if (!postIds.length) {
    console.log("[DEBUG] No post IDs provided, returning empty array");
    return [];
  }

  const chunkSize = 100;
  const postIdChunks = [];
  for (let i = 0; i < postIds.length; i += chunkSize) {
    postIdChunks.push(postIds.slice(i, i + chunkSize));
  }

  console.log("[DEBUG] Split post IDs into chunks:", {
    totalChunks: postIdChunks.length,
    chunkSize,
  });

  let allPosts: Post[] = [];
  for (const chunk of postIdChunks) {
    console.log("[DEBUG] Processing post ID chunk:", {
      chunkSize: chunk.length,
      chunkIds: chunk,
    });

    const { data: chunkPosts, error: chunkError } = await supabase
      .from("posts")
      .select("*")
      .in("id", chunk);

    if (chunkError) {
      console.error("[ERROR] Error fetching posts chunk:", {
        error: chunkError,
        chunk,
      });
      continue;
    }

    if (chunkPosts?.length) {
      console.log("[DEBUG] Found posts in chunk:", {
        requestedCount: chunk.length,
        foundCount: chunkPosts.length,
        missingCount: chunk.length - chunkPosts.length,
        missingIds: chunk.filter(
          (id) => !chunkPosts.find((post) => post.id === id)
        ),
      });
      allPosts = allPosts.concat(chunkPosts as Post[]);
    } else {
      console.log("[DEBUG] No posts found in chunk:", {
        chunkSize: chunk.length,
        chunkIds: chunk,
      });
    }
  }

  console.log("[DEBUG] getPostsByIds complete:", {
    requestedPostsCount: postIds.length,
    foundPostsCount: allPosts.length,
    missingPostsCount: postIds.length - allPosts.length,
  });

  return allPosts;
};

export default getPostsByIds;
