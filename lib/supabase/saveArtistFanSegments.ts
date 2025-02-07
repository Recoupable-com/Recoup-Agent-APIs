import supabase from "./serverClient";
import type { Database } from "../../types/database.types";

type FanSegment = Database["public"]["Tables"]["fan_segment"]["Row"];

interface SegmentWithIcon {
  name: string;
  icon?: string;
  size?: number;
  fanSocialId?: string | null;
}

/**
 * Saves segments to the artist_fan_segments table
 * @param segments Array of segments or segment names to save
 * @param artistId The artist ID to associate segments with
 * @param accountId Optional account ID to associate segments with
 * @returns Array of saved segment IDs
 */
const saveArtistFanSegments = async (
  segments: SegmentWithIcon[],
  artistSocialId: string
): Promise<{
  savedSegments: FanSegment[];
  error: Error | null;
}> => {
  try {
    // Format segments for insertion
    const segmentsToInsert = segments.map((segment: SegmentWithIcon) => ({
      artist_social_id: artistSocialId,
      fan_social_id: segment.fanSocialId,
      segment_name: segment.name,
    }));

    // Upsert segments to avoid duplicates
    const { data: savedSegments, error: upsertError } = await supabase
      .from("artist_fan_segment")
      .upsert(segmentsToInsert, {
        onConflict: "artist_social_id,fan_social_id,segment_name",
        ignoreDuplicates: true,
      })
      .select();

    if (upsertError) {
      console.error("Failed to save fan segments:", upsertError);
      return {
        savedSegments: [],
        error: new Error("Failed to save fan segments"),
      };
    }

    console.log(`✅ Saved ${savedSegments?.length || 0} fan segments`);
    return { savedSegments: savedSegments || [], error: null };
  } catch (error) {
    console.error("Error in saveArtistFanSegments:", error);
    return {
      savedSegments: [],
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error saving fan segments"),
    };
  }
};

export default saveArtistFanSegments;
