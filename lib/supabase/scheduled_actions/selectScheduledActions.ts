import supabase from "../serverClient";

type SelectScheduledActionsParams = {
  id?: string;
  account_id?: string;
  artist_account_id?: string;
};

/**
 * Selects scheduled actions (tasks) from the database
 */
export async function selectScheduledActions(
  params: SelectScheduledActionsParams
) {
  let query = supabase
    .from("scheduled_actions")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.id) {
    query = query.eq("id", params.id);
  }

  if (params.account_id) {
    query = query.eq("account_id", params.account_id);
  }

  if (params.artist_account_id) {
    query = query.eq("artist_account_id", params.artist_account_id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch scheduled actions: ${error.message}`);
  }

  return data || [];
}
