import supabase from "./serverClient.js";

interface ValidationResult {
  validFanIds: Set<string>;
  invalidFanIds: string[];
}

export const validateFanSocialIds = async (
  fanIds: string[]
): Promise<ValidationResult> => {
  console.log("[DEBUG] Validating fan social IDs:", {
    totalIds: fanIds.length,
    sampleIds: fanIds.slice(0, 3),
  });

  const uniqueFanIds = [...new Set(fanIds)];
  const { data: existingFanSocials, error: fanSocialsError } = await supabase
    .from("socials")
    .select("id")
    .in("id", uniqueFanIds);

  if (fanSocialsError) {
    console.error("[ERROR] Error verifying fan social IDs:", fanSocialsError);
    throw new Error("Failed to verify fan social IDs");
  }

  const validFanIds = new Set(existingFanSocials?.map((s) => s.id) || []);
  const invalidFanIds = uniqueFanIds.filter((id) => !validFanIds.has(id));

  if (invalidFanIds.length > 0) {
    console.error("[ERROR] Found invalid fan social IDs:", {
      count: invalidFanIds.length,
      sample: invalidFanIds.slice(0, 5),
    });
  }

  console.log("[DEBUG] Fan social ID validation results:", {
    total: uniqueFanIds.length,
    valid: validFanIds.size,
    invalid: invalidFanIds.length,
  });

  return {
    validFanIds,
    invalidFanIds,
  };
};

export default validateFanSocialIds;
