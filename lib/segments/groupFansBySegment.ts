import getChatCompletions from "../getChatCompletions.js";
import { instructions } from "../instructions.js";
import { Comment } from "../types/segment.types.js";

export interface SegmentGroup {
  segment_name: string;
  fan_social_ids: string[];
}

export const groupFansBySegment = async (
  segmentNames: string[],
  comments: Comment[]
): Promise<SegmentGroup[]> => {
  try {
    // Process comments in smaller batches to avoid LLM token limits
    const batchSize = 50; // Reduced from 100 to 50 for better handling
    const commentBatches: Comment[][] = [];
    for (let i = 0; i < comments.length; i += batchSize) {
      commentBatches.push(comments.slice(i, i + batchSize));
    }

    console.log(
      `[DEBUG] Split ${comments.length} comments into ${commentBatches.length} batches for processing`
    );

    // Log sample comments with more details about special characters
    console.log("[DEBUG] Sample comments:", {
      total: comments.length,
      sample: comments.slice(0, 3).map((c) => ({
        ...c,
        commentLength: c.comment_text.length,
        hasSpecialChars: /[^\x20-\x7E]/.test(c.comment_text),
        specialChars: c.comment_text.match(/[^\x20-\x7E]/g) || [],
        truncated:
          c.comment_text.length > 50
            ? `${c.comment_text.slice(0, 50)}...`
            : c.comment_text,
      })),
    });

    // Initialize segment groups
    const segmentGroups: { [key: string]: Set<string> } = {};
    segmentNames.forEach((name) => {
      segmentGroups[name] = new Set<string>();
    });

    // Process batches in parallel with reduced concurrency
    const concurrencyLimit = 5; // Reduced from 3 to 2 for stability
    for (let i = 0; i < commentBatches.length; i += concurrencyLimit) {
      const batchPromises = commentBatches
        .slice(i, i + concurrencyLimit)
        .map(async (batch, index) => {
          const batchIndex = i + index;
          console.log(
            `[DEBUG] Processing comment batch ${batchIndex + 1}/${commentBatches.length}`
          );

          try {
            const response = await getChatCompletions(
              [
                {
                  role: "system",
                  content: instructions.group_segments,
                },
                {
                  role: "user",
                  content: `Segment Names: ${JSON.stringify(segmentNames)}
Comments with IDs: ${JSON.stringify(batch)}`,
                },
              ],
              16384 // Increased max tokens to handle larger responses
            );

            if (!response) {
              console.error(`[ERROR] No response for batch ${batchIndex + 1}`);
              return;
            }

            // Clean and validate response
            const cleanedResponse = response
              .replace(/```json\n?|```/g, "")
              .trim();

            // Validate response structure before parsing
            if (
              !cleanedResponse.startsWith("[") ||
              !cleanedResponse.endsWith("]")
            ) {
              console.error(
                `[ERROR] Incomplete JSON array in batch ${batchIndex + 1}:`,
                {
                  startsWithBracket: cleanedResponse.startsWith("["),
                  endsWithBracket: cleanedResponse.endsWith("]"),
                  firstChars: cleanedResponse.substring(0, 100),
                  lastChars: cleanedResponse.substring(
                    cleanedResponse.length - 100
                  ),
                }
              );
              return;
            }

            try {
              const batchResults = JSON.parse(cleanedResponse);

              // Validate batch results structure
              if (!Array.isArray(batchResults)) {
                console.error(
                  `[ERROR] Invalid batch results structure for batch ${batchIndex + 1}:`,
                  {
                    type: typeof batchResults,
                    isArray: Array.isArray(batchResults),
                  }
                );
                return;
              }

              console.log(
                `[DEBUG] Successfully parsed JSON for batch ${batchIndex + 1}:`,
                {
                  resultCount: batchResults.length,
                  sampleResult: batchResults[0],
                  allSegmentNames: batchResults.map((r) => r.segment_name),
                }
              );

              // Update segment groups with batch results
              batchResults.forEach((result) => {
                if (
                  result.segment_name &&
                  Array.isArray(result.fan_social_ids) &&
                  segmentGroups[result.segment_name]
                ) {
                  result.fan_social_ids.forEach((id: string) =>
                    segmentGroups[result.segment_name].add(id)
                  );
                }
              });

              // Log progress after each successful batch
              console.log(
                `[DEBUG] Processed batch ${batchIndex + 1}, current unique fans per segment:`,
                Object.entries(segmentGroups)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .reduce(
                    (acc, [name, fans]) => {
                      acc[name] = fans.size;
                      return acc;
                    },
                    {} as { [key: string]: number }
                  )
              );
            } catch (error: any) {
              // Handle JSON parse error with more detailed logging
              if (error instanceof SyntaxError) {
                const positionMatch = error.message.match(/position (\d+)/);
                const position = positionMatch?.[1];
                const nearbyContent = position
                  ? cleanedResponse.substring(
                      Math.max(0, Number(position) - 100),
                      Math.min(cleanedResponse.length, Number(position) + 100)
                    )
                  : "N/A";

                console.error(
                  `[ERROR] JSON parse error in batch ${batchIndex + 1}:`,
                  {
                    error: error.message,
                    position,
                    nearbyContent,
                    responseLength: cleanedResponse.length,
                    isComplete:
                      cleanedResponse.startsWith("[") &&
                      cleanedResponse.endsWith("]"),
                  }
                );
              } else {
                console.error(
                  `[ERROR] Unexpected error in batch ${batchIndex + 1}:`,
                  error
                );
              }
            }
          } catch (error) {
            console.error(
              `[ERROR] Error processing batch ${batchIndex + 1}:`,
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

    console.log("[DEBUG] Generated", results.length, "non-empty segments:", {
      segmentNames: results.map((r) => r.segment_name),
      fanCounts: results.map((r) => r.fan_social_ids.length),
    });

    return results;
  } catch (error) {
    console.error("[ERROR] Failed to group fans by segment:", error);
    throw error;
  }
};
