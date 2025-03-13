import { Comment } from "../../types/segment.types.js";
import validateComments from "./validateComments.js";
import batchComments from "./batchComments.js";
import processBatchesInParallel from "./processBatchesInParallel.js";
import aggregateSegmentResults from "./aggregateSegmentResults.js";

export interface SegmentGroup {
  segment_name: string;
  fan_social_ids: string[];
}

/**
 * Groups fans by segment based on their comments
 *
 * @param segmentNames - Array of segment names to assign fans to
 * @param comments - Array of comments to process
 * @returns Array of segment groups with fan_social_ids
 */
export const groupFansBySegment = async (
  segmentNames: string[],
  comments: Comment[]
): Promise<SegmentGroup[]> => {
  try {
    const { validComments, usernameToIdMap } = validateComments(comments);

    const { batches: commentBatches } = batchComments(validComments);

    const { segmentGroups } = await processBatchesInParallel(
      commentBatches,
      segmentNames,
      usernameToIdMap
    );

    return aggregateSegmentResults(segmentGroups);
  } catch (error) {
    console.error("[ERROR] Failed to group fans by segment:", error);
    throw error;
  }
};

export default groupFansBySegment;
