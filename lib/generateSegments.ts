import { generateSegmentNames } from "./segments/generateSegmentNames.js";
import { groupFansBySegment } from "./segments/groupFansBySegment.js";
import createSegments from "./supabase/createSegments.js";
import updateArtistSegments from "./supabase/updateArtistSegments.js";
import createFanSegments from "./supabase/createFanSegments.js";
import { Comment } from "./types/segment.types.js";

interface GenerateSegmentsResult {
  segmentIds: string[];
  fanSegmentCount: number;
  error: Error | null;
}

export const generateSegments = async (
  comments: Comment[],
  artistAccountId: string
): Promise<GenerateSegmentsResult> => {
  console.log("Starting generateSegments with", comments.length, "comments");

  try {
    // Process comments in larger batches to reduce API calls
    const batchSize = 500;
    const commentBatches: string[][] = [];

    for (let i = 0; i < comments.length; i += batchSize) {
      const batch = comments.slice(i, i + batchSize).map((c) => c.comment_text);
      commentBatches.push(batch);
    }

    console.log("Split comments into", commentBatches.length, "batches");

    // Generate segments for each batch in parallel with concurrency limit
    const allSegmentNames = new Set<string>();
    const concurrencyLimit = 5;

    for (let i = 0; i < commentBatches.length; i += concurrencyLimit) {
      const batchPromises = commentBatches
        .slice(i, i + concurrencyLimit)
        .map(async (batch, index) => {
          const batchIndex = i + index;
          console.log(
            `Processing batch ${batchIndex + 1}/${commentBatches.length}`
          );
          try {
            const batchSegmentNames = await generateSegmentNames(batch);
            batchSegmentNames.forEach((name) => allSegmentNames.add(name));
            console.log(
              `Completed batch ${batchIndex + 1} with ${batchSegmentNames.length} segments`
            );
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            console.error(
              `Error processing batch ${batchIndex + 1}: ${errorMessage.substring(0, 500)}${
                errorMessage.length > 500 ? "..." : ""
              }`
            );
          }
        });

      await Promise.all(batchPromises);
    }

    const uniqueSegmentNames = Array.from(allSegmentNames);
    console.log("Generated", uniqueSegmentNames.length, "unique segment names");

    // Create segments in the segments table
    const { segmentIds, error: createError } = await createSegments({
      segmentNames: uniqueSegmentNames,
    });

    if (createError) {
      throw createError;
    }

    // Update artist-segment associations
    const { success: updateSuccess, error: updateError } =
      await updateArtistSegments({
        artistAccountId,
        segmentIds,
      });

    if (!updateSuccess || updateError) {
      throw updateError || new Error("Failed to update artist segments");
    }

    // Group fans into segments
    const segmentGroups = await groupFansBySegment(
      uniqueSegmentNames,
      comments
    );
    console.log("Grouped fans into", segmentGroups.length, "segments");

    // Create fan-segment associations
    const fanSegments = segmentGroups.flatMap((group) =>
      group.fan_social_ids.map((fanSocialId) => ({
        fan_social_id: fanSocialId,
        segment_id: segmentIds[uniqueSegmentNames.indexOf(group.segment_name)],
      }))
    );

    const {
      successCount,
      errorCount,
      error: fanSegmentError,
    } = await createFanSegments({
      fanSegments,
    });

    if (fanSegmentError) {
      throw fanSegmentError;
    }

    return {
      segmentIds,
      fanSegmentCount: successCount,
      error: null,
    };
  } catch (error) {
    console.error("[ERROR] Failed to generate segments:", error);
    return {
      segmentIds: [],
      fanSegmentCount: 0,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default generateSegments;
