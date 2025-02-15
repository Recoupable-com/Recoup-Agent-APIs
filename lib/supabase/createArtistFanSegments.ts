import supabase from "./serverClient.js";

interface FanSegment {
  username: string; // fan_social_id
  segmentName: string;
}

interface CreateSegmentsParams {
  fanSegments: FanSegment[];
  artistSocialIds: string[];
}

interface CreateSegmentsResult {
  successCount: number;
  errorCount: number;
}

export const createArtistFanSegments = async ({
  fanSegments,
  artistSocialIds,
}: CreateSegmentsParams): Promise<CreateSegmentsResult> => {
  console.log("[DEBUG] Creating artist-fan segments:", {
    fanCount: fanSegments.length,
    artistCount: artistSocialIds.length,
  });

  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < fanSegments.length; i += batchSize) {
    const batch = fanSegments.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(fanSegments.length / batchSize);

    console.log(`[DEBUG] Processing batch ${batchNum}/${totalBatches}:`, {
      batchSize: batch.length,
      sampleFanSegment: batch[0],
    });

    const segmentRecords = batch.flatMap((fanSegment) =>
      artistSocialIds.map((artist_social_id) => ({
        segment_name: fanSegment.segmentName,
        artist_social_id,
        fan_social_id: fanSegment.username,
        updated_at: new Date().toISOString(),
      }))
    );

    console.log(`[DEBUG] Created segment records for batch ${batchNum}:`, {
      recordCount: segmentRecords.length,
      sampleRecord: segmentRecords[0],
    });

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

  console.log("[DEBUG] Finished creating segments:", {
    totalAttempted: fanSegments.length * artistSocialIds.length,
    successCount,
    errorCount,
    successRate: `${((successCount / (fanSegments.length * artistSocialIds.length)) * 100).toFixed(2)}%`,
  });

  return {
    successCount,
    errorCount,
  };
};

export default createArtistFanSegments;
