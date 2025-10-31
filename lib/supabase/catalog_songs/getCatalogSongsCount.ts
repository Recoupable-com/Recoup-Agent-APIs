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
  let query = supabase
    .from("catalog_songs")
    .select(
      `catalog, songs!inner (song_artists!inner (accounts!inner (name)))`,
      { count: "exact", head: false }
    );

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

  // Always use data length for nested queries to ensure accurate count
  return data?.length ?? 0;
}
