import { Comment } from "../types/segment.types.js";
import { getLLMResponse } from "./fans/getLLMResponse.js";
import { parseAndValidateResponse } from "./parseAndValidateResponse.js";
import { processSegmentResults } from "./processSegmentResults.js";

export interface BatchProcessingResult {
  segmentGroups: Record<string, string[]>;
  success: boolean;
  error?: Error;
}

/**
 * Processes a single batch of comments with the LLM to assign them to segments
 *
 * @param batch - Batch of comments to process
 * @param segmentNames - Array of segment names to assign comments to
 * @param usernameToIdMap - Map of usernames to fan_social_ids for error recovery
 * @param batchIndex - Index of the current batch for logging
 * @param totalBatches - Total number of batches for logging
 * @returns Object containing segment groups and processing status
 */
export const processCommentBatch = async (
  batch: Comment[],
  segmentNames: string[],
  usernameToIdMap: Map<string, string>,
  batchIndex: number,
  totalBatches: number
): Promise<BatchProcessingResult> => {
  console.log(
    `[DEBUG] Processing comment batch ${batchIndex + 1}/${totalBatches}`
  );

  try {
    // Create a map of valid fan_social_ids for this batch
    const validFanSocialIds = new Set(batch.map((c) => c.fan_social_id));

    // Get response from LLM
    const response = await getLLMResponse(batch, segmentNames);

    if (!response) {
      console.error(`[ERROR] No response for batch ${batchIndex + 1}`);
      return {
        segmentGroups: {},
        success: false,
        error: new Error("No response from LLM"),
      };
    }

    // Parse and validate the response
    const parseResult = parseAndValidateResponse(response, batchIndex);

    if (!parseResult.success || !parseResult.batchResults) {
      return {
        segmentGroups: {},
        success: false,
        error: parseResult.error || new Error("Missing batch results"),
      };
    }

    // Process the batch results into segment groups
    const segmentGroups = processSegmentResults(
      parseResult.batchResults,
      segmentNames,
      {
        usernameToIdMap,
        validFanSocialIds,
        batchIndex,
      }
    );

    return { segmentGroups, success: true };
  } catch (error) {
    console.error(
      `[ERROR] Error processing batch ${batchIndex + 1}:`,
      error instanceof Error ? error.message : String(error)
    );

    return {
      segmentGroups: {},
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export default processCommentBatch;
