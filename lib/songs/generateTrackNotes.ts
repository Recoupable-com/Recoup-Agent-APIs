import { generateText } from "ai";
import { DEFAULT_MODEL } from "../consts";
import { SpotifyTrack } from "../../types/spotify.types";
import { getSpotifyArtistNames } from "./getSpotifyArtistNames";

const systemPrompt = `You are a music metadata expert that creates factual track descriptions for AI-powered music recommendation systems. 

CRITICAL: Only include information that can be directly derived from the provided track data. Do NOT estimate, guess, or hallucinate any details like:
- BPM/tempo (unless explicitly provided)
- Specific genres (unless clearly indicated by artist/title context)
- Instrumentation details
- Energy levels
- Mood characteristics

Focus on creating concise, factual metadata that helps AI assistants understand what the track actually is based on verifiable information.`;

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

    const userPrompt = `Track Details:
Name: ${track.name}
Artists: ${artistNames}
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
