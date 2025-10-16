import { SpotifyArtist } from "./getSpotifyArtists";

/**
 * Extracts and formats artist names from Spotify track artists array
 * @param artists - Array of Spotify artist objects
 * @returns Comma-separated string of artist names or "Unknown Artist"
 */
export function getSpotifyArtistNames(artists: SpotifyArtist[]): string {
  return (
    artists
      .map((artist) => artist.name)
      .filter(Boolean)
      .join(", ") || "Unknown Artist"
  );
}
