import getChatCompletions from "../getChatCompletions.js";
import { instructions } from "../instructions.js";

export const generateSegmentNames = async (
  comments: string[]
): Promise<string[]> => {
  const response = await getChatCompletions([
    {
      role: "system",
      content: instructions.generate_segments,
    },
    {
      role: "user",
      content: `Comments: ${JSON.stringify(comments)}`,
    },
  ]);

  if (!response) {
    throw new Error("Failed to generate segment names");
  }

  return JSON.parse(response.replace(/```json\n?|```/g, ""));
};
