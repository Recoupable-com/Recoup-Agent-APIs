import supabase from "../serverClient";
import { TablesInsert, Tables } from "../../../types/database.types";

/**
 * Inserts a new account into the accounts table
 */
export async function insertAccount(
  account: TablesInsert<"accounts">
): Promise<Tables<"accounts">> {
  const { data, error } = await supabase
    .from("accounts")
    .insert(account)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert account: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to insert account: No data returned");
  }

  return data;
}
