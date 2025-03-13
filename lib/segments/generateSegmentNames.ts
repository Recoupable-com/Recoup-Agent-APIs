import { getLangGraphCompletions } from "../langchain/getLangGraphCompletions.js";
import { instructions } from "../instructions.js";
import { Comment } from "../types/segment.types.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Generates segment names from comments using LangGraph with Claude 3.7 Sonnet
 *
 * @param comments - Array of comments or comment texts
 * @param maxSegments - Maximum number of segments to generate (default: 5)
 * @returns Array of segment names
 */
export const generateSegmentNames = async (
  comments: string[] | Comment[],
  maxSegments = 5
): Promise<string[]> => {
  console.log(
    `[Segments] Generating segment names for ${comments.length} comments`
  );

  // Generate a unique thread_id for this segment generation request
  const threadId = `segment-gen-${uuidv4()}`;

  // Construct the prompt for the LLM - only user message
  const messages = [
    {
      role: "user",
      content: `Generate ${maxSegments} segment names for these comments: ${JSON.stringify(comments)}`,
    },
  ];

  try {
    console.log("[Segments] Calling LangGraph for segment name generation");

    // Use LangGraph for completions - pass system message as messageModifier and include threadId
    const response = await getLangGraphCompletions(messages, {
      messageModifier: instructions.generate_segments,
      maxTokens: 4096,
      threadId,
    });

    if (!response) {
      throw new Error("No response from LLM");
    }

    console.log(
      "[Segments] Received response from LangGraph, parsing segment names"
    );

    // Parse the response to extract segment names
    let segmentNames: string[] = [];
    try {
      // Clean the response and parse JSON
      const cleanedResponse = response.replace(/```json\n?|```/g, "").trim();
      segmentNames = JSON.parse(cleanedResponse);

      console.log(
        `[Segments] Successfully parsed ${segmentNames.length} segment names`
      );
    } catch (error) {
      console.error("[Segments] Error parsing segment names:", error);
      throw new Error("Failed to parse segment names from LLM response");
    }

    return segmentNames;
  } catch (error) {
    console.error("[Segments] Error generating segment names:", error);
    throw error;
  }
};
