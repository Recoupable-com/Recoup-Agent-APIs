import supabase from "../serverClient";
import { TablesInsert } from "../../../types/database.types";

/**
 * Inserts catalog_songs relationships
 */
export async function insertCatalogSongs(
  catalogSongs: TablesInsert<"catalog_songs">[]
): Promise<TablesInsert<"catalog_songs">[]> {
  const { data, error } = await supabase
    .from("catalog_songs")
    .insert(catalogSongs)
    .select();

  if (error) {
    throw new Error(`Failed to insert catalog_songs: ${error.message}`);
  }

  return data || [];
}
