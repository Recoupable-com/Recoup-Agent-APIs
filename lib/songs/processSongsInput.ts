import { Tables } from "../../types/database.types";
import generateAccessToken from "../spotify/generateAccessToken";
import getIsrc from "../spotify/getIsrc";
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

  // Identify which songs need Spotify metadata enrichment
  const songsRequiringLookup = uniqueSongs.filter((song) => {
    const hasName =
      typeof song.name === "string" && song.name.trim().length > 0;
    const hasAlbum =
      typeof song.album === "string" && song.album.trim().length > 0;
    return !hasName || !hasAlbum;
  });

  if (songsRequiringLookup.length > 0) {
    const tokenResult = await generateAccessToken();

    if (!tokenResult.access_token || tokenResult.error) {
      throw tokenResult.error ?? new Error("Failed to generate Spotify token");
    }

    const accessToken = tokenResult.access_token;
    const spotifyTrackByIsrc = new Map<
      string,
      { name?: string | null; album?: { name?: string | null } | null }
    >();

    await Promise.all(
      songsRequiringLookup.map(async (song) => {
        const { track } = await getIsrc({
          isrc: song.isrc,
          accessToken,
        });

        if (track) {
          spotifyTrackByIsrc.set(song.isrc, {
            name: track.name,
            album: track.album,
          });
        }
      })
    );

    const enrichedSongs = uniqueSongs.map((song) => {
      const needsName =
        typeof song.name !== "string" || song.name.trim().length === 0;
      const needsAlbum =
        typeof song.album !== "string" || song.album.trim().length === 0;

      if (!needsName && !needsAlbum) {
        return song;
      }

      const track = spotifyTrackByIsrc.get(song.isrc);

      if (!track) {
        return song;
      }

      return {
        ...song,
        name: needsName && track.name ? track.name : song.name,
        album:
          needsAlbum && track.album?.name ? track.album.name : song.album,
      };
    });

    await upsertSongs(enrichedSongs);
    return;
  }

  // Upsert songs with Spotify-enriched metadata when available
  await upsertSongs(uniqueSongs);
}
