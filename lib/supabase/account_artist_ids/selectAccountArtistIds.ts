import serverClient from "@/lib/supabase/serverClient";
import { Tables } from "@/types/database.types";

type AccountArtistId = Tables<"account_artist_ids">;

type SelectAccountArtistIdsParams = {
  artist_id?: string;
  account_ids?: string[];
};

/**
 * Selects account_artist_ids with optional filters
 */
export async function selectAccountArtistIds(
  params: SelectAccountArtistIdsParams
): Promise<AccountArtistId[]> {
  let query = serverClient.from("account_artist_ids").select("*");

  // Add filters based on provided parameters
  if (params.artist_id) {
    query = query.eq("artist_id", params.artist_id);
  }

  if (params.account_ids && params.account_ids.length > 0) {
    query = query.in("account_id", params.account_ids);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch account_artist_ids: ${error.message}`);
  }

  return data || [];
}
