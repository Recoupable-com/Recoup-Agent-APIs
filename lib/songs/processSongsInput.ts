import { Tables } from "../../types/database.types";
import getSongsByIsrc from "./getSongsByIsrc";
import { upsertSongs } from "../supabase/songs/upsertSongs";
import { linkSongsToArtists } from "./linkSongsToArtists";

/**
 * Processes songs input - upserts songs
 */
export async function processSongsInput(
  songsInput: Tables<"songs">[]
): Promise<void> {
  // Extract unique songs (by ISRC) and prepare for upsert
  const songMap = new Map<string, Tables<"songs">>();

  songsInput.forEach((song) => {
    if (!song.isrc) return;

    songMap.set(song.isrc, song);
  });

  const uniqueSongs = Array.from(songMap.values());

  if (uniqueSongs.length === 0) return;

  const enrichedSongs = await getSongsByIsrc(uniqueSongs);

  const songsToUpsert = enrichedSongs.map((song) => {
    const { spotifyArtists, ...songRecord } = song;
    return songRecord;
  });

  await upsertSongs(songsToUpsert);

  await linkSongsToArtists(enrichedSongs);
}
