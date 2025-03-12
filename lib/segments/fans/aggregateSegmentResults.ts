import { SegmentGroup } from "./groupFansBySegment.js";

/**
 * Aggregates segment results from multiple batches into the final format
 *
 * @param segmentGroups - Record of segment names to sets of fan_social_ids
 * @returns Array of SegmentGroup objects
 */
export const aggregateSegmentResults = (
  segmentGroups: Record<string, Set<string>>
): SegmentGroup[] => {
  // Convert results to final format
  const results: SegmentGroup[] = Object.entries(segmentGroups)
    .filter(([_, fans]) => fans.size > 0)
    .map(([name, fans]) => ({
      segment_name: name,
      fan_social_ids: Array.from(fans),
    }));

  console.log("[DEBUG] Generated", results.length, "non-empty segments:", {
    segmentNames: results.map((r) => r.segment_name),
    fanCounts: results.map((r) => r.fan_social_ids.length),
  });

  return results;
};

export default aggregateSegmentResults;
