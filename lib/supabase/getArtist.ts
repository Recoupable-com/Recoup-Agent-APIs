import supabase from "./serverClient.js";
import type { Database } from "../../types/database.types";

type Account = Database["public"]["Tables"]["accounts"]["Row"];
type AccountInfo = Database["public"]["Tables"]["account_info"]["Row"];

const getArtist = async (artist_id: string | null) => {
  if (!artist_id) return null;

  try {
    const { data: account, error } = await supabase
      .from("accounts")
      .select(
        `
        *,
        account_info (
          id,
          image,
          instruction,
          label,
          organization
        )
      `
      )
      .eq("id", artist_id)
      .single();

    if (error || !account) return null;

    const accountInfo = account.account_info?.[0];
    if (!accountInfo) {
      // Return minimal account info if no account_info exists
      return {
        account_id: account.id,
        name: account.name || "",
        image: null,
        organization: null,
      };
    }

    return {
      account_id: account.id,
      name: account.name || "",
      image: accountInfo.image,
      organization: accountInfo.organization,
    };
  } catch (error) {
    console.error("Error in getArtist:", error);
    return null;
  }
};

export default getArtist;
