import supabase from "../serverClient";
import { TablesInsert } from "../../../types/database.types";

/**
 * Upserts songs (inserts if new, updates if exists)
 */
export async function upsertSongs(
  songs: TablesInsert<"songs">[]
): Promise<TablesInsert<"songs">[]> {
  const { data, error } = await supabase
    .from("songs")
    .upsert(songs, { onConflict: "isrc" })
    .select();

  if (error) {
    throw new Error(`Failed to upsert songs: ${error.message}`);
  }

  return data || [];
}
