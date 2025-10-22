import { SpotifyTrack } from "../../types/spotify.types";
import { getSpotifyArtistNames } from "./getSpotifyArtistNames";
import { getArtistsWithGenres } from "./getArtistsWithGenres";

/**
 * Generates descriptive notes for a Spotify track
 * @param track - The raw Spotify track object from getIsrc
 * @returns Promise containing the generated notes
 */
export const generateTrackNotes = async (
  track: SpotifyTrack
): Promise<string> => {
  if (!track.name) {
    return "";
  }

  try {
    const albumName = track.album.name || "Unknown Album";
    const artistsWithGenres = await getArtistsWithGenres(track);
    const durationMinutes = Math.floor(track.duration_ms / 60000);
    const durationSeconds = Math.floor((track.duration_ms % 60000) / 1000);
    const durationFormatted = `${durationMinutes}:${durationSeconds.toString().padStart(2, "0")}`;

    return `${track.name} by ${artistsWithGenres} - a musical track from ${albumName}. The track was released on ${track.album.release_date}, has a popularity score of ${track.popularity}/100 and a duration of ${durationFormatted}. It has an explicit flag of ${track.explicit ? "true" : "false"}.`;
  } catch (error) {
    console.error("Error generating track notes:", error);
    const artistNames = getSpotifyArtistNames(track.artists);
    return `${track.name} by ${artistNames} - a musical track from ${track.album.name || "an album"}.`;
  }
};
