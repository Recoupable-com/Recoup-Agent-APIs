import validateFanSocialIds from "./validateFanSocialIds.js";

export interface ProcessingOptions {
  usernameToIdMap: Map<string, string>;
  validFanSocialIds: Set<string>;
  batchIndex: number;
}

/**
 * Processes batch results into segment groups
 *
 * @param batchResults - The parsed results from the LLM
 * @param segmentNames - Array of segment names to assign comments to
 * @param options - Processing options including maps for validation
 * @returns Record of segment names to arrays of fan_social_ids
 */
export const processSegmentResults = (
  batchResults: any[],
  segmentNames: string[],
  options: ProcessingOptions
): Record<string, string[]> => {
  const { usernameToIdMap, validFanSocialIds, batchIndex } = options;

  // Initialize segment groups
  const segmentGroups: Record<string, string[]> = {};
  segmentNames.forEach((name) => {
    segmentGroups[name] = [];
  });

  // Process each result
  batchResults.forEach((result) => {
    if (
      result.segment_name &&
      Array.isArray(result.fan_social_ids) &&
      segmentGroups[result.segment_name] !== undefined
    ) {
      // Validate and recover fan_social_ids
      const { validatedIds, recoveredIds } = validateFanSocialIds(
        result.fan_social_ids,
        {
          usernameToIdMap,
          validFanSocialIds,
          batchIndex,
          segmentName: result.segment_name,
        }
      );

      // Add validated and recovered IDs to segment group
      segmentGroups[result.segment_name] = [
        ...segmentGroups[result.segment_name],
        ...validatedIds,
        ...recoveredIds,
      ];
    }
  });

  return segmentGroups;
};

export default processSegmentResults;
