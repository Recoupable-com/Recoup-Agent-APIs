import connectFansSegmentsToArtist from "../supabase/connectFansSegmentsToArtist.js";
import { SegmentGroup } from "./groupFansBySegment.js";

export const createFanSegments = async (
  segmentGroups: SegmentGroup[],
  artist_social_id: string
): Promise<string[]> => {
  const createdSegmentIds: string[] = [];

  for (const group of segmentGroups) {
    const fansSegments = group.fan_social_ids.map((fan_social_id) => ({
      [fan_social_id]: group.segment_name,
    }));

    await connectFansSegmentsToArtist(fansSegments, artist_social_id);
    createdSegmentIds.push(...group.fan_social_ids);
  }

  return createdSegmentIds;
};
