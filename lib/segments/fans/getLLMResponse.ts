import getChatCompletions from "../../getChatCompletions.js";
import { instructions } from "../../instructions.js";
import { Comment } from "../../types/segment.types.js";

/**
 * Gets a response from the LLM for a batch of comments and segment names
 *
 * @param batch - Batch of comments to process
 * @param segmentNames - Array of segment names to assign comments to
 * @returns The LLM response or null if there was an error
 */
export const getLLMResponse = async (
  batch: Comment[],
  segmentNames: string[]
): Promise<string | null> => {
  const messages = [
    {
      role: "system",
      content: instructions.group_segments,
    },
    {
      role: "user",
      content: `Segment Names: ${JSON.stringify(segmentNames)}
Comments with IDs: ${JSON.stringify(batch)}`,
    },
  ];

  try {
    return await getChatCompletions(messages, 16384);
  } catch (error) {
    console.error("[ERROR] Failed to get LLM response:", error);
    return null;
  }
};

export default getLLMResponse;
