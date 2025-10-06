import { Tables } from "../../types/database.types";
import getSongsByIsrc from "./getSongsByIsrc";
import { upsertSongs } from "../supabase/songs/upsertSongs";

/**
 * Processes songs input - upserts songs
 */
export async function processSongsInput(
  songsInput: Tables<"songs">[]
): Promise<void> {
  // Extract unique songs (by ISRC) and prepare for upsert
  const songMap = new Map<string, Tables<"songs">>();

  songsInput.forEach((song) => {
    if (!songMap.has(song.isrc) || !songMap.get(song.isrc)?.name) {
      // Keep the song if it's new or if current entry doesn't have name but new one does
      songMap.set(song.isrc, song);
    }
  });

  const uniqueSongs = Array.from(songMap.values());

  if (uniqueSongs.length === 0) return;

  const enrichedSongs = await getSongsByIsrc(uniqueSongs);
  await upsertSongs(enrichedSongs);
}
