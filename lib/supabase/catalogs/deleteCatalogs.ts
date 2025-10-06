import supabase from "../serverClient";

/**
 * Deletes catalogs by their IDs (cascades to catalog_songs)
 */
export async function deleteCatalogs(catalogIds: string[]): Promise<void> {
  const { error } = await supabase
    .from("catalogs")
    .delete()
    .in("id", catalogIds);

  if (error) {
    throw new Error(`Failed to delete catalogs: ${error.message}`);
  }
}
