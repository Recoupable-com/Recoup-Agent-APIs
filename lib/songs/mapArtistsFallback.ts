import { SpotifyArtist } from "./getSpotifyArtists";
import { SongWithSpotify } from "./getSongsByIsrc";

export function mapArtistsFallback(
  enrichedSongs: SongWithSpotify[],
  artistsByIsrc?: Record<string, string[]>
): SongWithSpotify[] {
  return enrichedSongs.map((song) => {
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
  });
}
