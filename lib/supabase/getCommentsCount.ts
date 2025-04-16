import supabase from "./serverClient";
import chunkArray from "../utils/chunkArray";

const CHUNK_SIZE = 100;

/**
 * Gets total comment count for a set of post IDs by chunking requests
 */
export const getCommentsCount = async (postIds: string[]): Promise<number> => {
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
  return totalCount;
};

export default getCommentsCount;
