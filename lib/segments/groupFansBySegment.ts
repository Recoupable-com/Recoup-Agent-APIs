import getChatCompletions from "../getChatCompletions.js";
import { instructions } from "../instructions.js";

interface CommentWithId {
  comment: string;
  fan_social_id: string;
}

export interface SegmentGroup {
  segment_name: string;
  fan_social_ids: string[];
}

export const groupFansBySegment = async (
  segmentNames: string[],
  commentsWithIds: CommentWithId[]
): Promise<SegmentGroup[]> => {
  const response = await getChatCompletions([
    {
      role: "system",
      content: instructions.group_segments,
    },
    {
      role: "user",
      content: `Segment Names: ${JSON.stringify(segmentNames)}
Comments with IDs: ${JSON.stringify(commentsWithIds)}`,
    },
  ]);

  if (!response) {
    throw new Error("Failed to group fans into segments");
  }

  return JSON.parse(response.replace(/```json\n?|```/g, ""));
};
