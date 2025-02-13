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
  const segmentNames = await generateSegmentNames(
    comments.map((c) => c.comment_text)
  );

  const commentsWithIds = comments.map((c) => ({
    comment: c.comment_text,
    fan_social_id: c.fan_social_id,
  }));

  const segmentGroups = await groupFansBySegment(segmentNames, commentsWithIds);

  return createFanSegments(segmentGroups, comments[0]?.artist_social_id || "");
};

export default generateSegments;
