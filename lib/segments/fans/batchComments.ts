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

  return {
    batches: commentBatches,
    batchCount: commentBatches.length,
    totalComments: comments.length,
  };
};

export default batchComments;
