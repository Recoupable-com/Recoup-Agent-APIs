import getSocialPlatformByLink from "../getSocialPlatformByLink";
import getUserNameSegment from "../getUserNameSegment";
import getTikTokFanProfile from "../tiktok/getFanProfile";
import getTwitterFanProfile from "../twitter/getProfile";
import supabase from "./serverClient";
import { Scraper } from "agent-twitter-client";

const scraper = new Scraper();

interface FanSegment {
  username: string; // This is actually the fan_social_id
  segmentName: string;
}

const connectFansSegmentsToArtist = async (
  fansSegments: FanSegment[],
  artistSocialId: string // This is actually a social_id, not an account_id
) => {
  try {
    console.log(`[DEBUG] Starting to connect fans to artist:`, {
      artistSocialId,
      totalFans: fansSegments.length,
      sampleFans: fansSegments.slice(0, 3),
    });

    // Get all social IDs associated with the same account as this artist social ID
    const { data: account_socials, error: accountError } = await supabase
      .from("account_socials")
      .select("social_id, account_id")
      .eq("social_id", artistSocialId);

    if (accountError) {
      console.error("[ERROR] Error fetching account socials:", accountError);
      throw accountError;
    }

    if (!account_socials?.length) {
      console.error(
        "[ERROR] No account found for artist social ID:",
        artistSocialId
      );
      return;
    }

    const accountId = account_socials[0].account_id;
    console.log(`[DEBUG] Found account ID: ${accountId}`);

    // Get all social IDs for this account
    const { data: all_socials, error: socialsError } = await supabase
      .from("account_socials")
      .select("social_id")
      .eq("account_id", accountId);

    if (socialsError) {
      console.error(
        "[ERROR] Error fetching all socials for account:",
        socialsError
      );
      throw socialsError;
    }

    const artist_social_ids = all_socials.map((as) => as.social_id);
    console.log(`[DEBUG] Artist social IDs:`, {
      count: artist_social_ids.length,
      ids: artist_social_ids,
    });

    // Verify all fan social IDs exist in the socials table
    const uniqueFanIds = [...new Set(fansSegments.map((f) => f.username))];
    const { data: existingFanSocials, error: fanSocialsError } = await supabase
      .from("socials")
      .select("id")
      .in("id", uniqueFanIds);

    if (fanSocialsError) {
      console.error("[ERROR] Error verifying fan social IDs:", fanSocialsError);
      throw fanSocialsError;
    }

    const validFanIds = new Set(existingFanSocials?.map((s) => s.id) || []);
    const invalidFanIds = uniqueFanIds.filter((id) => !validFanIds.has(id));

    if (invalidFanIds.length > 0) {
      console.error("[ERROR] Found invalid fan social IDs:", {
        count: invalidFanIds.length,
        sample: invalidFanIds.slice(0, 5),
      });
    }

    // Filter out segments with invalid fan IDs
    const validFanSegments = fansSegments.filter((f) =>
      validFanIds.has(f.username)
    );
    console.log(`[DEBUG] Valid fan segments:`, {
      total: fansSegments.length,
      valid: validFanSegments.length,
      invalid: fansSegments.length - validFanSegments.length,
    });

    // Process fan segments in batches
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < validFanSegments.length; i += batchSize) {
      const batch = validFanSegments.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(validFanSegments.length / batchSize);

      console.log(`[DEBUG] Processing batch ${batchNum}/${totalBatches}:`, {
        batchSize: batch.length,
        sampleFanSegment: batch[0],
      });

      const segmentRecords = batch.flatMap((fanSegment) =>
        artist_social_ids.map((artist_social_id) => ({
          segment_name: fanSegment.segmentName,
          artist_social_id: artist_social_id,
          fan_social_id: fanSegment.username,
          updated_at: new Date().toISOString(),
        }))
      );

      console.log(`[DEBUG] Created segment records for batch ${batchNum}:`, {
        recordCount: segmentRecords.length,
        sampleRecord: segmentRecords[0],
      });

      // Delete existing segments for this batch
      const { error: deleteError } = await supabase
        .from("artist_fan_segment")
        .delete()
        .in("artist_social_id", artist_social_ids)
        .in(
          "fan_social_id",
          batch.map((f) => f.username)
        );

      if (deleteError) {
        console.error(
          `[ERROR] Failed to delete existing segments in batch ${batchNum}:`,
          deleteError
        );
        errorCount += batch.length;
        continue;
      }

      console.log(`[DEBUG] Deleted existing segments for batch ${batchNum}`);

      // Insert new segment records
      const { data: inserted, error: insertError } = await supabase
        .from("artist_fan_segment")
        .insert(segmentRecords)
        .select();

      if (insertError) {
        console.error(
          `[ERROR] Failed to insert segments in batch ${batchNum}:`,
          insertError
        );
        errorCount += batch.length;
      } else {
        const insertedCount = inserted?.length || 0;
        successCount += insertedCount;
        console.log(
          `[DEBUG] Successfully inserted segments in batch ${batchNum}:`,
          {
            insertedCount,
            totalSuccessCount: successCount,
            sampleInserted: inserted?.[0],
          }
        );
      }
    }

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
