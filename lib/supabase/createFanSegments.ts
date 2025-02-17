import supabase from "./serverClient";

interface FanSegment {
  fan_social_id: string;
  segment_id: string;
}

interface CreateFanSegmentsParams {
  fanSegments: FanSegment[];
}

interface CreateFanSegmentsResult {
  successCount: number;
  errorCount: number;
  error: Error | null;
}

/**
 * Creates fan-segment associations in batches
 * @param params Object containing array of fan-segment associations
 * @returns Count of successful and failed operations, and any error that occurred
 */
const createFanSegments = async ({
  fanSegments,
}: CreateFanSegmentsParams): Promise<CreateFanSegmentsResult> => {
  try {
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    // Process fan segments in batches
    for (let i = 0; i < fanSegments.length; i += batchSize) {
      const batch = fanSegments.slice(i, i + batchSize);
      const fanSegmentRecords = batch.map((fanSegment) => ({
        ...fanSegment,
        updated_at: new Date().toISOString(),
      }));

      const { data: inserted, error: insertError } = await supabase
        .from("fan_segments")
        .insert(fanSegmentRecords)
        .select();

      if (insertError) {
        console.error("[ERROR] Failed to insert fan segments:", insertError);
        errorCount += batch.length;
      } else {
        const insertedCount = inserted?.length || 0;
        successCount += insertedCount;
      }
    }

    return {
      successCount,
      errorCount,
      error: null,
    };
  } catch (error) {
    console.error("[ERROR] Failed to create fan segments:", error);
    return {
      successCount: 0,
      errorCount: fanSegments.length,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default createFanSegments;
