import { selectSongsWithArtists } from "../supabase/songs/selectSongsWithArtists";

/**
 * Gets songs with artist information for the provided ISRCs and/or artist account IDs
 */
export async function getSongsWithArtists(
  isrcs?: string[],
  artistAccountIds?: string[]
): Promise<{ status: string; songs: any[] }> {
  const songs = await selectSongsWithArtists({ isrcs, artistAccountIds });

  return {
    status: "success",
    songs,
  };
}
