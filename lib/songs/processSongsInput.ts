import { TablesInsert } from "../../types/database.types";
import getSongsByIsrc, { SongWithSpotify } from "./getSongsByIsrc";
import { upsertSongs } from "../supabase/songs/upsertSongs";
import { linkSongsToArtists } from "./linkSongsToArtists";
import { queueRedisSongs } from "./queueRedisSongs";
import { SpotifyArtist } from "./getSpotifyArtists";
import { mapArtistsFallback } from "./mapArtistsFallback";

/**
 * Processes songs input - upserts songs and queues ISRCs to Redis
 */
export async function processSongsInput(
  songsInput: TablesInsert<"songs">[],
  artistsByIsrc?: Record<string, string[]>
): Promise<void> {
  // Extract unique songs (by ISRC) and prepare for upsert
  const songMap = new Map<string, TablesInsert<"songs">>();

  songsInput.forEach((song) => {
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
