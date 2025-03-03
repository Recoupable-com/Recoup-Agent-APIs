import supabase from "./serverClient";

interface CommentsBySocialIdsResponse {
  comments: string[];
  error: Error | null;
}

const getCommentsBySocialIds = async (
  socialIds: string[]
): Promise<CommentsBySocialIdsResponse> => {
  console.log("[DEBUG] Fetching comments for", socialIds.length, "social IDs");

  try {
    // Split socialIds into chunks to avoid URL length limits
    const chunkSize = 100;
    const chunks = [];
    for (let i = 0; i < socialIds.length; i += chunkSize) {
      chunks.push(socialIds.slice(i, i + chunkSize));
    }
    console.log(
      "[DEBUG] Split into",
      chunks.length,
      "chunks of size",
      chunkSize
    );

    let allComments: string[] = [];
    for (const chunk of chunks) {
      console.log("[DEBUG] Processing chunk of", chunk.length, "social IDs");
      const { data: chunkComments, error: chunkError } = await supabase
        .from("post_comments")
        .select(
          `
          comment
        `
        )
        .in("social_id", chunk);

      if (chunkError) {
        console.error(
          "[ERROR] Error fetching post_comments chunk:",
          chunkError
        );
        continue;
      }

      if (chunkComments?.length) {
        console.log(
          "[DEBUG] Found",
          chunkComments.length,
          "comments in current chunk"
        );
        allComments = allComments.concat(chunkComments.map((c) => c.comment));
      }
    }

    if (allComments.length === 0) {
      console.log("[DEBUG] No comments found for any social IDs");
      throw new Error("No comments found for these social IDs");
    }

    console.log("[DEBUG] Found total comments:", allComments.length);
    return { comments: allComments, error: null };
  } catch (error) {
    console.error("[ERROR] Failed to fetch comments:", error);
    return {
      comments: [],
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default getCommentsBySocialIds;
