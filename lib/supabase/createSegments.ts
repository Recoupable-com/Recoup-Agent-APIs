import supabase from "./serverClient";

interface CreateSegmentsParams {
  segmentNames: string[];
}

interface CreateSegmentsResult {
  segmentIds: string[];
  error: Error | null;
}

/**
 * Creates new segments in the segments table
 * @param params Object containing segment names
 * @returns Array of created segment IDs and any error that occurred
 */
const createSegments = async ({
  segmentNames,
}: CreateSegmentsParams): Promise<CreateSegmentsResult> => {
  try {
    const batchSize = 100;
    const allSegmentIds: string[] = [];

    // Process segments in batches
    for (let i = 0; i < segmentNames.length; i += batchSize) {
      const batch = segmentNames.slice(i, i + batchSize);
      const segmentRecords = batch.map((name) => ({
        name,
        updated_at: new Date().toISOString(),
      }));

      const { data: inserted, error: insertError } = await supabase
        .from("segments")
        .insert(segmentRecords)
        .select("id");

      if (insertError) {
        console.error("[ERROR] Failed to insert segments:", insertError);
        throw insertError;
      }

      if (inserted) {
        const batchIds = inserted.map((record) => record.id);
        allSegmentIds.push(...batchIds);
      }
    }

    return {
      segmentIds: allSegmentIds,
      error: null,
    };
  } catch (error) {
    console.error("[ERROR] Failed to create segments:", error);
    return {
      segmentIds: [],
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default createSegments;
