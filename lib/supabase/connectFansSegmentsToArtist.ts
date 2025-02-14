import getAccountSocials from "./getAccountSocials";
import getSocialAccounts from "./getSocialAccounts";
import validateFanSocialIds from "./validateFanSocialIds";
import deleteArtistFanSegments from "./deleteArtistFanSegments";
import createArtistFanSegments from "./createArtistFanSegments";

interface FanSegment {
  username: string; // fan_social_id
  segmentName: string;
}

const connectFansSegmentsToArtist = async (
  fansSegments: FanSegment[],
  artistSocialId: string // social_id
) => {
  try {
    console.log(`[DEBUG] Starting to connect fans to artist:`, {
      artistSocialId,
      totalFans: fansSegments.length,
      sampleFans: fansSegments.slice(0, 3),
    });

    // Get account info for the artist's social ID
    const socialAccounts = await getSocialAccounts(artistSocialId);
    const accountId = socialAccounts[0].account_id;
    console.log(`[DEBUG] Found account ID: ${accountId}`);

    // Get all social IDs for this account
    const accountSocials = await getAccountSocials(accountId);
    const artist_social_ids = accountSocials.map((as) => as.social_id);
    console.log(`[DEBUG] Artist social IDs:`, {
      count: artist_social_ids.length,
      ids: artist_social_ids,
    });

    // Validate fan social IDs
    const { validFanIds, invalidFanIds } = await validateFanSocialIds(
      fansSegments.map((f) => f.username)
    );

    // Filter out segments with invalid fan IDs
    const validFanSegments = fansSegments.filter((f) =>
      validFanIds.has(f.username)
    );
    console.log(`[DEBUG] Valid fan segments:`, {
      total: fansSegments.length,
      valid: validFanSegments.length,
      invalid: fansSegments.length - validFanSegments.length,
    });

    // Delete existing segments
    await deleteArtistFanSegments({
      artistSocialIds: artist_social_ids,
      fanSocialIds: Array.from(validFanIds),
    });

    // Create new segments
    const { successCount, errorCount } = await createArtistFanSegments({
      fanSegments: validFanSegments,
      artistSocialIds: artist_social_ids,
    });

    console.log(`[DEBUG] Finished processing all fans:`, {
      totalAttempted: validFanSegments.length,
      successCount,
      errorCount,
      successRate: `${((successCount / (validFanSegments.length * artist_social_ids.length)) * 100).toFixed(2)}%`,
    });

    return successCount;
  } catch (error) {
    console.error("[ERROR] Fatal error in connectFansSegmentsToArtist:", error);
    throw error;
  }
};

export default connectFansSegmentsToArtist;
