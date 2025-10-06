import { selectSongsWithArtists } from "../supabase/songs/selectSongsWithArtists";

/**
 * Gets songs with artist information for the provided ISRCs
 */
export async function getSongsWithArtists(
  isrcs?: string[]
): Promise<{ status: string; songs: any[] }> {
  const songs = await selectSongsWithArtists({ isrcs });

  return {
    status: "success",
    songs,
  };
}
