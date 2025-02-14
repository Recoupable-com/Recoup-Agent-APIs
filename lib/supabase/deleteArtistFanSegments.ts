import supabase from "./serverClient.js";

interface DeleteSegmentsParams {
  artistSocialIds: string[];
  fanSocialIds: string[];
}

export const deleteArtistFanSegments = async ({
  artistSocialIds,
  fanSocialIds,
}: DeleteSegmentsParams): Promise<void> => {
  console.log("[DEBUG] Deleting artist-fan segments:", {
    artistCount: artistSocialIds.length,
    fanCount: fanSocialIds.length,
  });

  const { error: deleteError } = await supabase
    .from("artist_fan_segment")
    .delete()
    .in("artist_social_id", artistSocialIds)
    .in("fan_social_id", fanSocialIds);

  if (deleteError) {
    console.error("[ERROR] Failed to delete existing segments:", deleteError);
    throw new Error("Failed to delete existing segments");
  }

  console.log("[DEBUG] Successfully deleted existing segments");
};

export default deleteArtistFanSegments;
