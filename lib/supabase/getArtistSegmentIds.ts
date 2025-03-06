import supabase from "./serverClient";

interface GetArtistSegmentIdsResponse {
  status: string;
  segmentIds: string[];
}

/**
 * Gets all segment IDs associated with an artist
 * @param artistAccountId The artist account ID
 * @returns Array of segment IDs
 */
export const getArtistSegmentIds = async (
  artistAccountId: string
): Promise<GetArtistSegmentIdsResponse> => {
  try {
    const { data: artistSegments, error } = await supabase
      .from("artist_segments")
      .select("segment_id")
      .eq("artist_account_id", artistAccountId);

    if (error) {
      console.error("[ERROR] Error fetching artist_segments:", error);
      return {
        status: "error",
        segmentIds: [],
      };
    }

    return {
      status: "success",
      segmentIds: artistSegments?.map((s) => s.segment_id) || [],
    };
  } catch (error) {
    console.error("[ERROR] Unexpected error in getArtistSegmentIds:", error);
    return {
      status: "error",
      segmentIds: [],
    };
  }
};
