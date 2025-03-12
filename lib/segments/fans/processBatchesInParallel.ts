import { Comment } from "../types/segment.types.js";
import processCommentBatch from "./processCommentBatch.js";

export interface ParallelProcessingResult {
  segmentGroups: Record<string, Set<string>>;
  successCount: number;
  failureCount: number;
}

/**
 * Processes batches of comments in parallel with concurrency control
 *
 * @param commentBatches - Array of comment batches to process
 * @param segmentNames - Array of segment names to assign comments to
 * @param usernameToIdMap - Map of usernames to fan_social_ids for error recovery
 * @param concurrencyLimit - Maximum number of batches to process in parallel
 * @returns Object containing aggregated segment groups and processing statistics
 */
export const processBatchesInParallel = async (
  commentBatches: Comment[][],
  segmentNames: string[],
  usernameToIdMap: Map<string, string>,
  concurrencyLimit = 5
): Promise<ParallelProcessingResult> => {
  const segmentGroups: Record<string, Set<string>> = {};
  segmentNames.forEach((name) => {
    segmentGroups[name] = new Set<string>();
  });

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < commentBatches.length; i += concurrencyLimit) {
    const batchPromises = commentBatches
      .slice(i, i + concurrencyLimit)
      .map(async (batch, index) => {
        const batchIndex = i + index;

        const result = await processCommentBatch(
          batch,
          segmentNames,
          usernameToIdMap,
          batchIndex,
          commentBatches.length
        );

        if (result.success) {
          Object.entries(result.segmentGroups).forEach(([segmentName, ids]) => {
            if (segmentGroups[segmentName]) {
              ids.forEach((id) => segmentGroups[segmentName].add(id));
            }
          });

          successCount++;
        } else {
          failureCount++;
        }

        console.log(
          `[DEBUG] Processed batch ${batchIndex + 1}, current unique fans per segment:`,
          Object.entries(segmentGroups)
            .sort(([a], [b]) => a.localeCompare(b))
            .reduce(
              (acc, [name, fans]) => {
                acc[name] = fans.size;
                return acc;
              },
              {} as { [key: string]: number }
            )
        );
      });

    await Promise.all(batchPromises);
  }

  return {
    segmentGroups,
    successCount,
    failureCount,
  };
};

export default processBatchesInParallel;
