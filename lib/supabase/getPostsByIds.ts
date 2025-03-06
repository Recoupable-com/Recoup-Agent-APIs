import supabase from "./serverClient";

export interface Post {
  id: string;
  post_url: string;
  updated_at: string;
  platform?: string;
  content?: string;
  media_url?: string;
  created_at?: string;
  media_type?: string;
}

/**
 * Fetches posts by IDs in chunks to avoid URL length limits
 * @param postIds Array of post IDs to fetch
 * @returns Array of posts
 */
export const getPostsByIds = async (postIds: string[]): Promise<Post[]> => {
  if (!postIds.length) {
    return [];
  }

  const chunkSize = 100;
  const postIdChunks = [];
  for (let i = 0; i < postIds.length; i += chunkSize) {
    postIdChunks.push(postIds.slice(i, i + chunkSize));
  }

  let allPosts: Post[] = [];
  for (const chunk of postIdChunks) {
    const { data: chunkPosts, error: chunkError } = await supabase
      .from("posts")
      .select("*")
      .in("id", chunk);

    if (chunkError) {
      console.error("[ERROR] Error fetching posts chunk:", chunkError);
      continue;
    }

    if (chunkPosts?.length) {
      allPosts = allPosts.concat(chunkPosts as Post[]);
    }
  }

  return allPosts;
};

export default getPostsByIds;
