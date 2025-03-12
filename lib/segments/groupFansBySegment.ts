import getChatCompletions from "../getChatCompletions.js";
import { instructions } from "../instructions.js";
import { Comment } from "../types/segment.types.js";

export interface SegmentGroup {
  segment_name: string;
  fan_social_ids: string[];
}

// UUID validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const groupFansBySegment = async (
  segmentNames: string[],
  comments: Comment[]
): Promise<SegmentGroup[]> => {
  try {
    // Pre-validate comments to ensure all have valid fan_social_ids
    const validComments = comments.filter((comment) => {
      const isValid =
        comment.fan_social_id &&
        typeof comment.fan_social_id === "string" &&
        UUID_REGEX.test(comment.fan_social_id);

      if (!isValid) {
        console.warn(
          `[WARN] Filtering out comment with invalid fan_social_id: ${
            comment.fan_social_id || "undefined"
          }`
        );
      }

      return isValid;
    });

    console.log(
      `[DEBUG] Pre-validation: ${validComments.length}/${comments.length} comments have valid fan_social_ids`
    );

    // Create a mapping from username to fan_social_id for error recovery
    const usernameToIdMap = new Map<string, string>();
    validComments.forEach((comment) => {
      if (comment.social_data?.username && comment.fan_social_id) {
        usernameToIdMap.set(
          comment.social_data.username,
          comment.fan_social_id
        );
      }
    });

    console.log(
      `[DEBUG] Created username to ID map with ${usernameToIdMap.size} entries for error recovery`
    );

    // Process comments in smaller batches to avoid LLM token limits
    const batchSize = 50; // Reduced from 100 to 50 for better handling
    const commentBatches: Comment[][] = [];

    for (let i = 0; i < validComments.length; i += batchSize) {
      commentBatches.push(validComments.slice(i, i + batchSize));
    }

    console.log(
      `[DEBUG] Split ${validComments.length} comments into ${commentBatches.length} batches for processing`
    );

    // Log sample comments with more details about special characters
    console.log("[DEBUG] Sample comments:", {
      total: validComments.length,
      sample: validComments.slice(0, 3).map((c) => ({
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
            // Create a map of valid fan_social_ids for this batch
            const validFanSocialIds = new Set(
              batch.map((c) => c.fan_social_id)
            );

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

              // Update segment groups with batch results
              batchResults.forEach((result) => {
                if (
                  result.segment_name &&
                  Array.isArray(result.fan_social_ids) &&
                  segmentGroups[result.segment_name]
                ) {
                  // Validate and filter fan_social_ids
                  const validatedIds = result.fan_social_ids.filter(
                    (id: string) => {
                      // Check if id is a valid UUID and exists in our valid IDs set
                      const isValid =
                        typeof id === "string" &&
                        UUID_REGEX.test(id) &&
                        validFanSocialIds.has(id);

                      if (!isValid && typeof id === "string") {
                        // Check if this might be a username instead of an ID
                        if (usernameToIdMap.has(id)) {
                          const correctId = usernameToIdMap.get(id);
                          console.warn(
                            `[WARN] Recovered username "${id}" to correct fan_social_id "${correctId}" in batch ${batchIndex + 1}`
                          );
                          // Add the correct ID to the segment group
                          if (correctId && validFanSocialIds.has(correctId)) {
                            segmentGroups[result.segment_name].add(correctId);
                          }
                        } else {
                          console.warn(
                            `[WARN] Invalid fan_social_id in batch ${batchIndex + 1}: "${id}"`
                          );
                        }
                      }

                      return isValid;
                    }
                  );

                  // Add validated IDs to segment group
                  validatedIds.forEach((id: string) =>
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
