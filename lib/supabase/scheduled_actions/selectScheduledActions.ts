import supabase from "../serverClient";

type SelectScheduledActionsParams = {
  id?: string;
};

/**
 * Selects scheduled actions (jobs) from the database
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

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch scheduled actions: ${error.message}`);
  }

  return data || [];
}
