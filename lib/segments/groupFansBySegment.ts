import getChatCompletions from "../getChatCompletions.js";
import { instructions } from "../instructions.js";

interface Comment {
  comment: string;
  fan_social_id: string;
}

export interface SegmentGroup {
  segment_name: string;
  fan_social_ids: string[];
}

export const groupFansBySegment = async (
  segmentNames: string[],
  comments: Comment[]
): Promise<SegmentGroup[]> => {
  try {
    // Process comments in larger batches to reduce API calls
    const batchSize = 500; // Increased from 100 to 500
    const commentBatches: Comment[][] = [];
    for (let i = 0; i < comments.length; i += batchSize) {
      commentBatches.push(comments.slice(i, i + batchSize));
    }

    console.log(
      `Split ${comments.length} comments into ${commentBatches.length} batches for processing`
    );

    // Initialize segment groups
    const segmentGroups: { [key: string]: Set<string> } = {};
    segmentNames.forEach((name) => {
      segmentGroups[name] = new Set<string>();
    });

    // Process batches in parallel with concurrency limit
    const concurrencyLimit = 5; // Process 5 batches at a time
    for (let i = 0; i < commentBatches.length; i += concurrencyLimit) {
      const batchPromises = commentBatches
        .slice(i, i + concurrencyLimit)
        .map(async (batch, index) => {
          const batchIndex = i + index;
          console.log(
            `Processing comment batch ${batchIndex + 1}/${commentBatches.length}`
          );

          try {
            const response = await getChatCompletions([
              {
                role: "system",
                content: instructions.group_segments,
              },
              {
                role: "user",
                content: `Segment Names: ${JSON.stringify(segmentNames)}
Comments with IDs: ${JSON.stringify(batch)}`,
              },
            ]);

            if (!response) {
              console.error(`No response for batch ${batchIndex + 1}`);
              return;
            }

            // Clean the response to ensure valid JSON
            const cleanedResponse = response
              .replace(/```json\n?|```/g, "")
              .trim();
            const batchResults = JSON.parse(cleanedResponse);

            // Add fans to their segments
            batchResults.forEach((group: SegmentGroup) => {
              if (segmentGroups[group.segment_name]) {
                group.fan_social_ids.forEach((id) => {
                  segmentGroups[group.segment_name].add(id);
                });
              }
            });

            console.log(
              `Processed batch ${batchIndex + 1}, current unique fans per segment:`,
              Object.entries(segmentGroups)
                .map(([name, fans]) => `${name}: ${fans.size}`)
                .join(", ")
            );
          } catch (error) {
            console.error(
              `Error processing batch ${batchIndex + 1}:`,
              error instanceof Error ? error.message : String(error)
            );
          }
        });

      // Wait for current batch of promises to complete before processing next batch
      await Promise.all(batchPromises);
    }

    // Convert results to final format
    const results: SegmentGroup[] = Object.entries(segmentGroups)
      .filter(([_, fans]) => fans.size > 0)
      .map(([name, fans]) => ({
        segment_name: name,
        fan_social_ids: Array.from(fans),
      }));

    console.log(`Generated ${results.length} non-empty segments`);
    return results;
  } catch (error) {
    console.error(
      "Error in groupFansBySegment:",
      error instanceof Error ? error.message : String(error)
    );
    throw new Error("Failed to group fans into segments");
  }
};
