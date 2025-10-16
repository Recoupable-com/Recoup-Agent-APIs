import supabase from "../serverClient";
import { Tables } from "../../../types/database.types";

type SongWithArtists = Tables<"songs"> & {
  artists: Tables<"accounts">[];
};

type SelectSongsParams = {
  isrcs?: string[];
  artistAccountIds?: string[];
};

/**
 * Selects songs with related artist data
 */
export async function selectSongsWithArtists(
  params: SelectSongsParams
): Promise<SongWithArtists[]> {
  let query = supabase
    .from("songs")
    .select(
      `
      isrc,
      name,
      album,
      notes,
      updated_at,
      song_artists (
        artist,
        accounts!inner (
          id,
          name,
          timestamp
        )
      )
    `
    )
    .order("updated_at", { ascending: false });

  // Add filters based on provided parameters
  if (params.isrcs && params.isrcs.length > 0) {
    query = query.in("isrc", params.isrcs);
  }

  if (params.artistAccountIds && params.artistAccountIds.length > 0) {
    query = query.in("song_artists.artist", params.artistAccountIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch songs: ${error.message}`);
  }

  // Transform the nested data structure
  const songs: SongWithArtists[] = (data || []).map((song: any) => {
    const { song_artists, ...songData } = song;
    return {
      ...songData,
      artists: song_artists?.map((sa: any) => sa.accounts) || [],
    };
  });

  return songs;
}
