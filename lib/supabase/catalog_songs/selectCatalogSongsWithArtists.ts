import supabase from "../serverClient";
import { Tables } from "../../../types/database.types";
import { getCatalogSongsCount } from "./getCatalogSongsCount";

type CatalogSongWithArtists = {
  catalog_id: string;
} & Tables<"songs"> & {
    artists: Tables<"accounts">[];
  };

type SelectCatalogSongsParams = {
  catalogId?: string;
  isrcs?: string[];
  page?: number;
  limit?: number;
};

type CatalogSongsWithPagination = {
  songs: CatalogSongWithArtists[];
  total_count: number;
};

/**
 * Selects catalog songs with related artist data and pagination info
 */
export async function selectCatalogSongsWithArtists(
  params: SelectCatalogSongsParams
): Promise<CatalogSongsWithPagination> {
  const { catalogId, isrcs, page = 1, limit = 20 } = params;

  // Get the total count for pagination
  const totalCount = await getCatalogSongsCount({
    catalogId,
    isrcs,
  });

  // Now get the actual data with pagination
  let query = supabase
    .from("catalog_songs")
    .select(
      `
      catalog,
      songs!inner (
        isrc,
        name,
        album,
        lyrics,
        updated_at,
        song_artists (
          artist,
          accounts!inner (
            id,
            name,
            timestamp
          )
        )
      )
    `
    )
    .order("updated_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  // Add filters based on provided parameters
  if (catalogId) {
    query = query.eq("catalog", catalogId);
  }

  if (isrcs && isrcs.length > 0) {
    query = query.in("song", isrcs);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch catalog songs: ${error.message}`);
  }

  // Transform the nested data structure
  const catalogSongs: CatalogSongWithArtists[] = (data || []).map(
    (catalogSong: any) => {
      const { catalog, songs } = catalogSong;
      const { song_artists, ...songData } = songs;

      return {
        catalog_id: catalog,
        ...songData,
        artists: song_artists?.map((sa: any) => sa.accounts) || [],
      };
    }
  );

  return {
    songs: catalogSongs,
    total_count: totalCount,
  };
}
