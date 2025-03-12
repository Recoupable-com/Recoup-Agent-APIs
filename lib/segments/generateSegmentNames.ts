import getChatCompletions from "../getChatCompletions.js";
import { instructions } from "../instructions.js";
import { Comment } from "../types/segment.types.js";

export const generateSegmentNames = async (
  comments: string[] | Comment[]
): Promise<string[]> => {
  const response = await getChatCompletions([
    {
      role: "system",
      content: instructions.generate_segments,
    },
    {
      role: "user",
      content:
        typeof comments[0] === "string"
          ? `Comments: ${JSON.stringify(comments)}`
          : `Comments with social data: ${JSON.stringify(comments)}`,
    },
  ]);

  if (!response) {
    throw new Error("Failed to generate segment names");
  }

  return JSON.parse(response.replace(/```json\n?|```/g, ""));
};
