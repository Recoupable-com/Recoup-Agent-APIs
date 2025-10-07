import supabase from "../serverClient";
import { TablesInsert } from "../../../types/database.types";

type DeleteCatalogSongRequest = {
  catalog_id: string;
  isrc: string;
};

/**
 * Deletes catalog_songs relationships for specific catalog-song pairs
 */
export async function deleteCatalogSongs(
  deleteRequests: DeleteCatalogSongRequest[]
): Promise<string[]> {
  // Delete each specific combination individually using Promise.all for better performance
  const deletePromises = deleteRequests.map(async (request) => {
    const { error } = await supabase
      .from("catalog_songs")
      .delete()
      .eq("catalog", request.catalog_id)
      .eq("song", request.isrc);

    if (error) {
      throw new Error(
        `Failed to delete catalog_songs relationship for catalog ${request.catalog_id} and song ${request.isrc}: ${error.message}`
      );
    }

    return request.catalog_id;
  });

  const catalogIds = await Promise.all(deletePromises);
  return catalogIds;
}
