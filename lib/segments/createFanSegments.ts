import connectFansSegmentsToArtist from "../supabase/connectFansSegmentsToArtist.js";
import { SegmentGroup } from "./groupFansBySegment.js";

export const createFanSegments = async (
  segmentGroups: SegmentGroup[],
  artist_social_id: string
): Promise<string[]> => {
  const createdSegmentIds: string[] = [];

  for (const group of segmentGroups) {
    // Format fan segments in the expected structure
    const fansSegments = group.fan_social_ids.map((fan_social_id: string) => ({
      username: fan_social_id, // Pass the social_id as username since that's what we have
      segmentName: group.segment_name,
    }));

    console.log(
      `Creating segments for ${fansSegments.length} fans in group ${group.segment_name}`
    );

    try {
      await connectFansSegmentsToArtist(fansSegments, artist_social_id);
      createdSegmentIds.push(...group.fan_social_ids);
      console.log(
        `Successfully created segments for group ${group.segment_name}`
      );
    } catch (error) {
      console.error(
        `Error creating segments for group ${group.segment_name}:`,
        error
      );
    }
  }

  return createdSegmentIds;
};
