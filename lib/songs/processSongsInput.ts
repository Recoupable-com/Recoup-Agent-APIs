import { TablesInsert } from "../../types/database.types";
import getSongsByIsrc, { SongWithSpotify } from "./getSongsByIsrc";
import { upsertSongs } from "../supabase/songs/upsertSongs";
import { linkSongsToArtists } from "./linkSongsToArtists";
import { queueRedisSongs } from "./queueRedisSongs";
import { SpotifyArtist } from "./getSpotifyArtists";

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

  // If CSV provided artists and Spotify did not return artists for a song,
  // synthesize artists from the provided names as a fallback for linking.
  const songsWithArtistFallback: SongWithSpotify[] = enrichedSongs.map(
    (song) => {
      const hasSpotifyArtists = (song.spotifyArtists ?? []).length > 0;
      const providedNames = artistsByIsrc?.[song.isrc];

      if (hasSpotifyArtists || !providedNames || providedNames.length === 0) {
        return song;
      }

      const synthesized: SpotifyArtist[] = providedNames
        .map((name) => (typeof name === "string" ? name.trim() : ""))
        .filter((name) => name.length > 0)
        .map((name) => ({ id: null, name }));

      return synthesized.length > 0
        ? { ...song, spotifyArtists: synthesized }
        : song;
    }
  );

  const songsToUpsert = songsWithArtistFallback.map((song) => {
    const { spotifyArtists, ...songRecord } = song;
    return songRecord;
  });

  await upsertSongs(songsToUpsert);

  await linkSongsToArtists(songsWithArtistFallback);

  await queueRedisSongs(songsWithArtistFallback);
}
