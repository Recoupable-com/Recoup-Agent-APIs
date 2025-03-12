import { Comment } from "../types/segment.types.js";

// UUID validation regex
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ValidationResult {
  validComments: Comment[];
  usernameToIdMap: Map<string, string>;
  validCount: number;
  totalCount: number;
}

/**
 * Validates comments to ensure they have valid fan_social_ids and creates a username-to-ID mapping
 * for error recovery.
 *
 * @param comments - Array of comments to validate
 * @returns Object containing valid comments and username-to-ID mapping
 */
export const validateComments = (comments: Comment[]): ValidationResult => {
  // Filter comments with valid fan_social_ids
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
      usernameToIdMap.set(comment.social_data.username, comment.fan_social_id);
    }
  });

  console.log(
    `[DEBUG] Created username to ID map with ${usernameToIdMap.size} entries for error recovery`
  );

  return {
    validComments,
    usernameToIdMap,
    validCount: validComments.length,
    totalCount: comments.length,
  };
};

export default validateComments;
