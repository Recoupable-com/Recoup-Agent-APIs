import supabase from "../serverClient";

type GetCatalogSongsCountParams = {
  catalogId?: string;
  isrcs?: string[];
  artistName?: string;
};

/**
 * Gets the total count of catalog songs matching the provided filters
 */
export async function getCatalogSongsCount(
  params: GetCatalogSongsCountParams
): Promise<number> {
  // For artist name filtering, we need to select nested relationships
  // Otherwise, use head count for better performance
  const needsNestedData = !!params.artistName;

  const baseQuery = supabase.from("catalog_songs");

  let query;
  if (needsNestedData) {
    query = baseQuery.select(
      `catalog, songs!inner (song_artists!inner (accounts!inner (name)))`,
      { count: "exact", head: false }
    );
  } else {
    query = baseQuery.select("*", { count: "exact", head: true });
  }

  // Apply filters based on provided parameters
  if (params.catalogId) {
    query = query.eq("catalog", params.catalogId);
  }

  if (params.isrcs && params.isrcs.length > 0) {
    query = query.in("song", params.isrcs);
  }

  if (params.artistName) {
    // Filter by artist name in nested song_artists relationship
    query = query.eq("songs.song_artists.accounts.name", params.artistName);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("getCatalogSongsCount error:", error);
    throw new Error(
      `Failed to count catalog songs: ${error.message || JSON.stringify(error)}`
    );
  }

  // When using nested queries, count might not be accurate, use data length instead
  return needsNestedData ? (data?.length ?? 0) : (count ?? 0);
}
