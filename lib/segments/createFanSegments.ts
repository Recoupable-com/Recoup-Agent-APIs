import connectFansSegmentsToArtist from "../supabase/connectFansSegmentsToArtist.js";
import { SegmentGroup } from "./groupFansBySegment.js";

export const createFanSegments = async (
  segmentGroups: SegmentGroup[],
  artist_social_id: string
): Promise<string[]> => {
  console.log(
    "[DEBUG] Creating fan segments for",
    segmentGroups.length,
    "groups"
  );

  // Prepare all fan segments in a single array
  const allFanSegments = segmentGroups.flatMap((group) =>
    group.fan_social_ids.map((fan_social_id) => ({
      username: fan_social_id, // Pass the social_id as username since that's what we have
      segmentName: group.segment_name,
    }))
  );

  console.log(
    "[DEBUG] Prepared",
    allFanSegments.length,
    "fan segments for creation"
  );

  try {
    // Process all segments in a single batch
    const createdCount = await connectFansSegmentsToArtist(
      allFanSegments,
      artist_social_id
    );

    console.log("[DEBUG] Successfully created segments:", {
      totalAttempted: allFanSegments.length,
      created: createdCount,
    });

    // Return all fan social IDs that were processed
    return segmentGroups.flatMap((group) => group.fan_social_ids);
  } catch (error) {
    console.error("[ERROR] Failed to create fan segments:", error);
    throw error;
  }
};
