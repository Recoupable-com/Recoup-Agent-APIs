import supabase from "./serverClient";

interface ArtistBySegmentResponse {
  artistAccountId: string | null;
  error: Error | null;
}

/**
 * Gets the artist account ID associated with a segment
 * @param segmentId The ID of the segment
 * @returns The artist's account ID and any error that occurred
 */
const getArtistBySegmentId = async (
  segmentId: string
): Promise<ArtistBySegmentResponse> => {
  try {
    const { data, error } = await supabase
      .from("artist_segments")
      .select("artist_account_id")
      .eq("segment_id", segmentId)
      .single();

    if (error) {
      console.error("[ERROR] Failed to get artist by segment:", error);
      return {
        artistAccountId: null,
        error: new Error("Failed to get artist by segment"),
      };
    }

    if (!data) {
      return {
        artistAccountId: null,
        error: new Error("No artist found for segment"),
      };
    }

    return {
      artistAccountId: data.artist_account_id,
      error: null,
    };
  } catch (error) {
    console.error("[ERROR] Unexpected error in getArtistBySegmentId:", error);
    return {
      artistAccountId: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default getArtistBySegmentId;
