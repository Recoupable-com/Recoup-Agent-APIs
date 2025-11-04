import supabase from "../serverClient";
import type { Tables, TablesUpdate } from "../../../types/database.types";

type UpdateScheduledActionParams = {
  id: string;
} & TablesUpdate<"scheduled_actions">;

export async function updateScheduledAction(
  params: UpdateScheduledActionParams
): Promise<Tables<"scheduled_actions">> {
  const { id, ...updateData } = params;

  const { data, error } = await supabase
    .from("scheduled_actions")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update scheduled action: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to update scheduled action: no data returned");
  }

  return data;
}
