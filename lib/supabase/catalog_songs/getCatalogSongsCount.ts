import supabase from "../serverClient";

type GetCatalogSongsCountParams = {
  catalogId?: string;
  isrcs?: string[];
};

/**
 * Gets the total count of catalog songs matching the provided filters
 */
export async function getCatalogSongsCount(
  params: GetCatalogSongsCountParams
): Promise<number> {
  let query = supabase
    .from("catalog_songs")
    .select("*", { count: "exact", head: true });

  // Apply filters based on provided parameters
  if (params.catalogId) {
    query = query.eq("catalog", params.catalogId);
  }

  if (params.isrcs && params.isrcs.length > 0) {
    query = query.in("song", params.isrcs);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to count catalog songs: ${error.message}`);
  }

  return count || 0;
}
