import supabase from "./serverClient.js";

interface DeleteSegmentsParams {
  artistSocialIds: string[];
  // Keeping fanSocialIds in interface for backward compatibility but marking as optional
  fanSocialIds?: string[];
}

export const deleteArtistFanSegments = async ({
  artistSocialIds,
  fanSocialIds, // Keep parameter for backward compatibility
}: DeleteSegmentsParams): Promise<void> => {
  console.log("[DEBUG] Deleting all segments for artists:", {
    artistCount: artistSocialIds.length,
    // Log if fanSocialIds were provided but won't be used
    unusedFanCount: fanSocialIds?.length,
    note: "Deleting ALL segments for specified artists regardless of fans",
  });

  const { error: deleteError } = await supabase
    .from("artist_fan_segment")
    .delete()
    .in("artist_social_id", artistSocialIds);

  if (deleteError) {
    console.error("[ERROR] Failed to delete existing segments:", deleteError);
    throw new Error("Failed to delete existing segments");
  }

  console.log(
    "[DEBUG] Successfully deleted all segments for specified artists"
  );
};

export default deleteArtistFanSegments;
