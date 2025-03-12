import { Comment } from "../types/segment.types.js";

/**
 * Formats comments for segment generation, including social data when available
 *
 * @param comments - Array of comments or comment texts
 * @returns Formatted comments with social data for LLM processing
 */
export const formatCommentsWithSocialData = (
  comments: string[] | Comment[]
): any[] => {
  // If comments are strings, return them directly
  if (comments.length === 0) {
    return [];
  }

  if (typeof comments[0] === "string") {
    return comments as string[];
  }

  // Format comments with social data
  return (comments as Comment[]).map((comment) => ({
    // Make fan_social_id more prominent by placing it first
    fan_social_id: comment.fan_social_id, // IMPORTANT: This is the UUID to use for grouping
    id_for_grouping: comment.fan_social_id, // Duplicate the ID with a clearer name
    text: comment.comment_text,
    // Rename social to social_data to make it clearer
    social_data: comment.social_data || {},
    // Add a flag to indicate this is a valid UUID that must be used
    _use_this_id_for_grouping: true,
  }));
};

export default formatCommentsWithSocialData;
