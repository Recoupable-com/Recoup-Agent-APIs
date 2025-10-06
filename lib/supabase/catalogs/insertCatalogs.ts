import supabase from "../serverClient";
import { TablesInsert, Tables } from "../../../types/database.types";

/**
 * Inserts catalogs (supports batch writes)
 */
export async function insertCatalogs(
  catalogs: TablesInsert<"catalogs">[]
): Promise<Tables<"catalogs">[]> {
  const { data, error } = await supabase
    .from("catalogs")
    .insert(catalogs)
    .select();

  if (error) {
    throw new Error(`Failed to insert catalogs: ${error.message}`);
  }

  return data || [];
}
