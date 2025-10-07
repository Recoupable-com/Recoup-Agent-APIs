import supabase from "../serverClient";
import { TablesInsert } from "../../../types/database.types";

/**
 * Upserts catalog_songs relationships (inserts if new, ignores if exists)
 */
export async function insertCatalogSongs(
  catalogSongs: TablesInsert<"catalog_songs">[]
): Promise<TablesInsert<"catalog_songs">[]> {
  const { data, error } = await supabase
    .from("catalog_songs")
    .upsert(catalogSongs, {
      onConflict: "catalog,song",
      ignoreDuplicates: true,
    })
    .select();

  if (error) {
    throw new Error(`Failed to upsert catalog_songs: ${error.message}`);
  }

  return data || [];
}
