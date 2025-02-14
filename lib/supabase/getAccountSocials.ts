import supabase from "./serverClient.js";

export const getAccountSocials = async (accountId: string) => {
  console.log("[DEBUG] Fetching account socials for accountId:", accountId);

  const { data: accountSocials, error: accountSocialsError } = await supabase
    .from("account_socials")
    .select("social_id")
    .eq("account_id", accountId);

  if (accountSocialsError) {
    console.error(
      "[ERROR] Error fetching account_socials:",
      accountSocialsError
    );
    throw new Error("Failed to fetch account socials");
  }

  if (!accountSocials?.length) {
    console.log("[DEBUG] No social accounts found for accountId:", accountId);
    throw new Error("No social accounts found for this artist");
  }

  console.log("[DEBUG] Found account_socials:", accountSocials.length);
  return accountSocials;
};

export default getAccountSocials;
