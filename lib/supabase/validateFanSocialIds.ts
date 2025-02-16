import supabase from "./serverClient.js";

// UUID validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ValidationResult {
  validFanIds: Set<string>;
  invalidFanIds: string[];
  validationStats: {
    total: number;
    valid: number;
    invalid: number;
    invalidRate: string;
    formatErrors: string[];
    notFoundErrors: string[];
  };
}

// Helper function to validate UUID format
const isValidUUID = (id: string): boolean => {
  return UUID_REGEX.test(id);
};

export const validateFanSocialIds = async (
  fanIds: string[]
): Promise<ValidationResult> => {
  console.log("[DEBUG] Validating fan social IDs:", {
    totalIds: fanIds.length,
    sampleIds: fanIds.slice(0, 3),
  });

  // First validate UUID format
  const formatValidIds = fanIds.filter(isValidUUID);
  const formatInvalidIds = fanIds.filter((id) => !isValidUUID(id));

  console.log("[DEBUG] Format validation results:", {
    total: fanIds.length,
    validFormat: formatValidIds.length,
    invalidFormat: formatInvalidIds.length,
    invalidSamples: formatInvalidIds.slice(0, 5),
  });

  // Skip database validation temporarily and return format-valid IDs
  const stats = {
    total: fanIds.length,
    valid: formatValidIds.length,
    invalid: formatInvalidIds.length,
    invalidRate: `${((formatInvalidIds.length / fanIds.length) * 100).toFixed(2)}%`,
    formatErrors: formatInvalidIds.slice(0, 5),
    notFoundErrors: [], // Empty since we're skipping DB validation
  };

  console.log("[DEBUG] Fan social ID validation results:", stats);

  return {
    validFanIds: new Set(formatValidIds),
    invalidFanIds: formatInvalidIds,
    validationStats: stats,
  };
};

export default validateFanSocialIds;
