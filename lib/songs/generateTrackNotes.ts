import { generateText } from "ai";
import { DEFAULT_MODEL } from "../consts";
import { SpotifyTrack } from "../../types/spotify.types";
import { getSpotifyArtistNames } from "./getSpotifyArtistNames";
import { getArtistsWithGenres } from "./getArtistsWithGenres";

const systemPrompt = `You are a music metadata expert that creates contextual track descriptions for AI-powered music recommendation systems. Your goal is to help AI assistants understand what this track sounds like and when/where it would be appropriate to recommend.

Based on the track information provided, create a concise description that includes:
- Genre and musical style characteristics
- Mood, vibe, and emotional tone
- Energy level and tempo
- Recommended context for this track (e.g., party, workout, chill, emotional, celebration, etc.)
- Key musical elements and instrumentation

Your notes should help an AI assistant answer: "When would I recommend this track?" and "What does this track sound/feel like?"`;

/**
 * Generates descriptive notes for a Spotify track using AI
 * @param track - The raw Spotify track object from getIsrc
 * @returns Promise containing the generated notes
 */
export const generateTrackNotes = async (
  track: SpotifyTrack
): Promise<string> => {
  if (!track.name) {
    return "";
  }

  const artistNames = getSpotifyArtistNames(track.artists);

  try {
    const albumName = track.album.name || "Unknown Album";
    const artistsWithGenres = await getArtistsWithGenres(track);

    const userPrompt = `Track Details:
Name: ${track.name}
Artists: ${artistsWithGenres}
Album: ${albumName}
Duration: ${Math.floor(track.duration_ms / 1000)}s
Popularity: ${track.popularity}/100
Release Date: ${track.album.release_date}
Explicit: ${track.explicit ? "Yes" : "No"}

Generate a concise, factual track description based only on the provided information:`;

    const result = await generateText({
      model: DEFAULT_MODEL,
      system: systemPrompt,
      prompt: userPrompt,
    });
    return result.text.trim();
  } catch (error) {
    console.error("Error generating track notes:", error);
    return `"${track.name}" by ${artistNames} - A musical track from ${track.album.name || "an album"}.`;
  }
};
