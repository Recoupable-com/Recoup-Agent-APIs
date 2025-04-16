import supabase from "./serverClient";
import chunkArray from "../utils/chunkArray";
import { Comment } from "../../types/agent";

const CHUNK_SIZE = 100;

interface GetPaginatedCommentsParams {
  postIds: string[];
  offset: number;
  limit: number;
}

/**
 * Gets paginated comments for a set of post IDs by chunking requests
 */
export const getPaginatedComments = async ({
  postIds,
  offset,
  limit,
}: GetPaginatedCommentsParams): Promise<Comment[]> => {
  console.log("[DEBUG] Getting paginated comments");
  const postIdChunks = chunkArray(postIds, CHUNK_SIZE);
  const startChunk = Math.floor(offset / CHUNK_SIZE);
  const endChunk = Math.floor((offset + limit) / CHUNK_SIZE);
  let allComments: Comment[] = [];

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
  return allComments.slice(startIndex, startIndex + limit);
};

export default getPaginatedComments;
