import { SongWithSpotify } from "./getSongsByIsrc";
import { getPreferredArtistAccountIds } from "../supabase/songs/getPreferredArtistAccountIds";
import { insertSongArtists } from "../supabase/song_artists/insertSongArtists";

export async function linkSongsToArtists(
  songs: SongWithSpotify[]
): Promise<void> {
  const normalizedToOriginal = new Map<string, string>();

  songs.forEach((song) => {
    (song.spotifyArtists ?? []).forEach((artist) => {
      const trimmed = artist?.name?.trim();
      if (!trimmed) return;

      const normalized = trimmed.toLowerCase();
      if (!normalizedToOriginal.has(normalized)) {
        normalizedToOriginal.set(normalized, trimmed);
      }
    });
  });

  if (normalizedToOriginal.size === 0) {
    return;
  }

  const uniqueArtistNames = Array.from(normalizedToOriginal.values());

  const nameToAccountId = await getPreferredArtistAccountIds(
    uniqueArtistNames
  );

  const songArtists = songs.flatMap((song) => {
    const artistIds = new Set<string>();

    (song.spotifyArtists ?? []).forEach((artist) => {
      const normalized = artist?.name?.trim().toLowerCase();
      if (!normalized) return;

      const accountId = nameToAccountId.get(normalized);
      if (accountId) {
        artistIds.add(accountId);
      }
    });

    return Array.from(artistIds).map((artistId) => ({
      song: song.isrc,
      artist: artistId,
    }));
  });

  await insertSongArtists(songArtists);
}
