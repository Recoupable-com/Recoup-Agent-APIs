import supabase from "./serverClient";

interface UpdateArtistSegmentsParams {
  artistAccountId: string;
  segmentIds: string[];
}

interface UpdateArtistSegmentsResult {
  success: boolean;
  error: Error | null;
}

/**
 * Updates artist-segment associations by first deleting existing records
 * and then creating new ones
 * @param params Object containing artist account ID and segment IDs
 * @returns Success status and any error that occurred
 */
const updateArtistSegments = async ({
  artistAccountId,
  segmentIds,
}: UpdateArtistSegmentsParams): Promise<UpdateArtistSegmentsResult> => {
  try {
    const { error: deleteError } = await supabase
      .from("artist_segments")
      .delete()
      .eq("artist_account_id", artistAccountId);

    if (deleteError) {
      console.error(
        "[ERROR] Failed to delete existing artist segments:",
        deleteError
      );
      throw deleteError;
    }

    const artistSegmentRecords = segmentIds.map((segmentId) => ({
      artist_account_id: artistAccountId,
      segment_id: segmentId,
      updated_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("artist_segments")
      .insert(artistSegmentRecords);

    if (insertError) {
      console.error("[ERROR] Failed to insert artist segments:", insertError);
      throw insertError;
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("[ERROR] Failed to update artist segments:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default updateArtistSegments;
