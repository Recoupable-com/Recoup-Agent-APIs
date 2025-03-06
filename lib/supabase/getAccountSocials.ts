import { Social } from "../../types/agent";
import supabase from "./serverClient";

interface AccountSocialsResponse {
  status: string;
  socials: Social[];
}

export const getAccountSocials = async (
  accountId: string
): Promise<AccountSocialsResponse> => {
  try {
    const { data: accountSocials, error: accountSocialsError } = await supabase
      .from("account_socials")
      .select("social_id")
      .eq("account_id", accountId);

    if (accountSocialsError) {
      console.error(
        "[ERROR] Error fetching account_socials:",
        accountSocialsError
      );
      return {
        status: "error",
        socials: [],
      };
    }

    if (!accountSocials?.length) {
      console.log("[DEBUG] No social accounts found for accountId:", accountId);
      return {
        status: "success",
        socials: [],
      };
    }

    const socialIds = accountSocials.map((s) => s.social_id);
    const { data: socials, error: socialsError } = await supabase
      .from("socials")
      .select(
        "id, username, avatar, profile_url, region, bio, followerCount, followingCount, updated_at"
      )
      .in("id", socialIds);

    if (socialsError) {
      console.error("[ERROR] Error fetching socials:", socialsError);
      return {
        status: "error",
        socials: [],
      };
    }

    return {
      status: "success",
      socials: socials || [],
    };
  } catch (error) {
    console.error("[ERROR] Unexpected error in getAccountSocials:", error);
    return {
      status: "error",
      socials: [],
    };
  }
};

export default getAccountSocials;
