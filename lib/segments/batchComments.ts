import { Comment } from "../types/segment.types.js";

export interface BatchingResult {
  batches: Comment[][];
  batchCount: number;
  totalComments: number;
}

/**
 * Splits comments into smaller batches to avoid LLM token limits
 *
 * @param comments - Array of comments to batch
 * @param batchSize - Maximum number of comments per batch (default: 50)
 * @returns Object containing batched comments and metadata
 */
export const batchComments = (
  comments: Comment[],
  batchSize = 50
): BatchingResult => {
  const commentBatches: Comment[][] = [];

  for (let i = 0; i < comments.length; i += batchSize) {
    commentBatches.push(comments.slice(i, i + batchSize));
  }

  console.log(
    `[DEBUG] Split ${comments.length} comments into ${commentBatches.length} batches for processing`
  );

  // Log sample comments with more details about special characters
  if (comments.length > 0) {
    console.log("[DEBUG] Sample comments:", {
      total: comments.length,
      sample: comments.slice(0, 3).map((c) => ({
        ...c,
        commentLength: c.comment_text.length,
        hasSpecialChars: /[^\x20-\x7E]/.test(c.comment_text),
        specialChars: c.comment_text.match(/[^\x20-\x7E]/g) || [],
        truncated:
          c.comment_text.length > 50
            ? `${c.comment_text.slice(0, 50)}...`
            : c.comment_text,
      })),
    });
  }

  return {
    batches: commentBatches,
    batchCount: commentBatches.length,
    totalComments: comments.length,
  };
};

export default batchComments;
