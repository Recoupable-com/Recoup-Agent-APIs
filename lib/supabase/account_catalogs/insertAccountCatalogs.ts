import supabase from "../serverClient";
import { TablesInsert } from "../../../types/database.types";

/**
 * Inserts account_catalog relationships (supports batch writes)
 */
export async function insertAccountCatalogs(
  accountCatalogs: TablesInsert<"account_catalogs">[]
): Promise<void> {
  const { error } = await supabase
    .from("account_catalogs")
    .insert(accountCatalogs);

  if (error) {
    throw new Error(`Failed to insert account_catalogs: ${error.message}`);
  }
}
