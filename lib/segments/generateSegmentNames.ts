import getChatCompletions from "../getChatCompletions.js";
import { instructions } from "../instructions.js";
import { Comment } from "../types/segment.types.js";
import formatCommentsWithSocialData from "./formatCommentsWithSocialData.js";

export const generateSegmentNames = async (
  comments: string[] | Comment[]
): Promise<string[]> => {
  // Format comments to include social data if available
  const formattedComments = formatCommentsWithSocialData(comments);
  console.log("formatCommentsWithSocialData", formattedComments);
  const response = await getChatCompletions([
    {
      role: "system",
      content: instructions.generate_segments,
    },
    {
      role: "user",
      content:
        typeof formattedComments[0] === "string"
          ? `Comments: ${JSON.stringify(formattedComments)}`
          : `Comments with social data: ${JSON.stringify(formattedComments)}`,
    },
  ]);

  if (!response) {
    throw new Error("Failed to generate segment names");
  }

  return JSON.parse(response.replace(/```json\n?|```/g, ""));
};
