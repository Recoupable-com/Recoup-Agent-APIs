import supabase from "./serverClient.js";

interface SocialAccount {
  social_id: string;
  account_id: string;
}

export const getSocialAccounts = async (
  socialId: string
): Promise<SocialAccount[]> => {
  console.log("[DEBUG] Fetching account info for socialId:", socialId);

  const { data: accountSocials, error: accountSocialsError } = await supabase
    .from("account_socials")
    .select("social_id, account_id")
    .eq("social_id", socialId);

  if (accountSocialsError) {
    console.error(
      "[ERROR] Error fetching account_socials:",
      accountSocialsError
    );
    throw new Error("Failed to fetch social accounts");
  }

  if (!accountSocials?.length) {
    console.log("[DEBUG] No account found for socialId:", socialId);
    throw new Error("No account found for this social ID");
  }

  console.log("[DEBUG] Found account_socials:", accountSocials.length);
  return accountSocials;
};

export default getSocialAccounts;
