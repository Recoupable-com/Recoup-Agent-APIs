import { TablesInsert } from "../../types/database.types";
import getSongsByIsrc, { SongWithSpotify } from "./getSongsByIsrc";
import { upsertSongs } from "../supabase/songs/upsertSongs";
import { linkSongsToArtists } from "./linkSongsToArtists";
import { queueRedisSongs } from "./queueRedisSongs";
import { mapArtistsFallback } from "./mapArtistsFallback";
import { formatSongsInput, SongInput } from "./formatSongsInput";

/**
 * Processes songs input with artists fallback support
 * - Accepts raw song input with optional artists field
 * - Formats and enriches songs with Spotify data
 * - Links artists using Spotify data or fallback artists when provided
 * - Queues ISRCs to Redis
 */
export async function processSongsInput(
  songsInput: SongInput[]
): Promise<void> {
  // Format input: extract artists and prepare for upsert
  const { songsForUpsert, artistsByIsrc } = formatSongsInput(songsInput);

  // Extract unique songs (by ISRC) and prepare for upsert
  const songMap = new Map<string, TablesInsert<"songs">>();

  songsForUpsert.forEach((song) => {
    if (!song.isrc) return;

    songMap.set(song.isrc, song);
  });

  const uniqueSongs = Array.from(songMap.values());

  if (uniqueSongs.length === 0) return;

  const enrichedSongs = await getSongsByIsrc(uniqueSongs);

  const songsWithArtists: SongWithSpotify[] = mapArtistsFallback(
    enrichedSongs,
    artistsByIsrc
  );

  const songsToUpsert = songsWithArtists.map((song) => {
    const { spotifyArtists, ...songRecord } = song;
    return songRecord;
  });

  await upsertSongs(songsToUpsert);

  await linkSongsToArtists(songsWithArtists);

  await queueRedisSongs(songsWithArtists);
}
