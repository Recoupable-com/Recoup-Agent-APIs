import supabase from "../serverClient";
import { TablesInsert } from "../../../types/database.types";

export type CreateJobInput = TablesInsert<"scheduled_actions">;

export async function insertScheduledAction(input: CreateJobInput) {
  const { data, error } = await supabase
    .from("scheduled_actions")
    .insert(input)
    .select("*");

  if (error) {
    throw new Error(`Failed to create job: ${error.message}`);
  }

  return data || [];
}
