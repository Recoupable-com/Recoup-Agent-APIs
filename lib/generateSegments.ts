import { generateSegmentNames } from "./segments/generateSegmentNames.js";
import { groupFansBySegment } from "./segments/groupFansBySegment.js";
import { createFanSegments } from "./segments/createFanSegments.js";

interface Comment {
  comment_text: string;
  fan_social_id: string;
  artist_social_id: string;
}

export const generateSegments = async (
  comments: Comment[]
): Promise<string[]> => {
  console.log("Starting generateSegments with", comments.length, "comments");

  // Process comments in larger batches to reduce API calls
  const batchSize = 500; // Increased from 100 to 500
  const commentBatches: string[][] = [];

  for (let i = 0; i < comments.length; i += batchSize) {
    const batch = comments.slice(i, i + batchSize).map((c) => c.comment_text);
    commentBatches.push(batch);
  }

  console.log("Split comments into", commentBatches.length, "batches");

  // Generate segments for each batch in parallel with concurrency limit
  const allSegmentNames = new Set<string>();
  const concurrencyLimit = 5; // Process 5 batches at a time

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
          // Trim error message to prevent "string too long" issues
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(
            `Error processing batch ${batchIndex + 1}: ${errorMessage.substring(0, 500)}${
              errorMessage.length > 500 ? "..." : ""
            }`
          );
        }
      });

    // Wait for current batch of promises to complete before processing next batch
    await Promise.all(batchPromises);
  }

  const uniqueSegmentNames = Array.from(allSegmentNames);
  console.log("Generated", uniqueSegmentNames.length, "unique segment names");

  const commentsWithIds = comments.map((c) => ({
    comment: c.comment_text,
    fan_social_id: c.fan_social_id,
  }));

  const segmentGroups = await groupFansBySegment(
    uniqueSegmentNames,
    commentsWithIds
  );
  console.log("Grouped fans into", segmentGroups.length, "segments");

  return createFanSegments(segmentGroups, comments[0]?.artist_social_id || "");
};

export default generateSegments;
