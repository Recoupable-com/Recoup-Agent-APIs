import supabase from "./serverClient.js";

interface PostComment {
  comment: string;
  social_id: string;
  post_id: string;
}

export const getPostComments = async (postIds: string[]) => {
  console.log("[DEBUG] Fetching post_comments for", postIds.length, "posts");

  // Split postIds into smaller chunks to avoid URL length limits
  const chunkSize = 100;
  const postIdChunks = [];
  for (let i = 0; i < postIds.length; i += chunkSize) {
    postIdChunks.push(postIds.slice(i, i + chunkSize));
  }
  console.log(
    "[DEBUG] Split into",
    postIdChunks.length,
    "chunks of size",
    chunkSize
  );

  let allPostComments: PostComment[] = [];
  for (const chunk of postIdChunks) {
    console.log("[DEBUG] Processing chunk of", chunk.length, "post IDs");
    const { data: chunkComments, error: chunkError } = await supabase
      .from("post_comments")
      .select(
        `
        comment,
        social_id,
        post_id
      `
      )
      .in("post_id", chunk);

    if (chunkError) {
      console.error("[ERROR] Error fetching post_comments chunk:", chunkError);
      continue;
    }

    if (chunkComments?.length) {
      console.log(
        "[DEBUG] Found",
        chunkComments.length,
        "comments in current chunk"
      );
      allPostComments = allPostComments.concat(chunkComments as PostComment[]);
    }
  }

  if (allPostComments.length === 0) {
    console.log("[DEBUG] No comments found for any posts");
    throw new Error("No comments found for these posts");
  }

  console.log("[DEBUG] Found total post_comments:", allPostComments.length);
  return allPostComments;
};

export default getPostComments;
