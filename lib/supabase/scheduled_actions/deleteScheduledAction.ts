import supabase from "../serverClient";

/**
 * Deletes a scheduled action (task) by its ID
 */
export async function deleteScheduledAction(id: string): Promise<void> {
  const { error } = await supabase
    .from("scheduled_actions")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete scheduled action: ${error.message}`);
  }
}
