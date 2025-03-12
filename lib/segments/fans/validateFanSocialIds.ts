import { UUID_REGEX } from "./validateComments.js";

export interface ValidationOptions {
  usernameToIdMap: Map<string, string>;
  validFanSocialIds: Set<string>;
  batchIndex: number;
  segmentName: string;
}

export interface ValidationOutput {
  validatedIds: string[];
  recoveredIds: string[];
}

/**
 * Validates fan_social_ids and attempts to recover usernames that were incorrectly used as IDs
 *
 * @param ids - Array of potential fan_social_ids to validate
 * @param options - Validation options including maps for recovery
 * @returns Object containing validated and recovered IDs
 */
export const validateFanSocialIds = (
  ids: string[],
  options: ValidationOptions
): ValidationOutput => {
  const { usernameToIdMap, validFanSocialIds, batchIndex, segmentName } =
    options;
  const recoveredIds: string[] = [];

  const validatedIds = ids.filter((id) => {
    const isValid =
      typeof id === "string" &&
      UUID_REGEX.test(id) &&
      validFanSocialIds.has(id);

    if (!isValid && typeof id === "string") {
      if (usernameToIdMap.has(id)) {
        const correctId = usernameToIdMap.get(id);
        console.warn(
          `[WARN] Recovered username "${id}" to correct fan_social_id "${correctId}" in batch ${batchIndex + 1} for segment "${segmentName}"`
        );

        if (correctId && validFanSocialIds.has(correctId)) {
          recoveredIds.push(correctId);
        }
      } else {
        console.warn(
          `[WARN] Invalid fan_social_id in batch ${batchIndex + 1}: "${id}"`
        );
      }
    }

    return isValid;
  });

  return {
    validatedIds,
    recoveredIds,
  };
};

export default validateFanSocialIds;
