import { generateText, stepCountIs } from "ai";
import { DEFAULT_MODEL } from "../consts";
import { SpotifyTrack } from "../../types/spotify.types";
import { getSpotifyArtistNames } from "./getSpotifyArtistNames";
import { getArtistsWithGenres } from "./getArtistsWithGenres";
import searchWebTool from "../perplexity/searchWebTool";

const systemPrompt = `You are a music metadata expert that creates contextual track descriptions for AI-powered music recommendation systems. Your goal is to help AI assistants understand what this track sounds like and when/where it would be appropriate to recommend.

MANDATORY: You MUST use the searchWeb tool to research additional information about this track. Search for:
- Mood, vibe, and emotional tone
- Recommended context for this track (e.g., party, workout, chill, emotional, celebration, etc.)
- Genre classifications from reliable music sources
- Lyrics analysis and song meaning
- Album context and significance  
- Artist background and musical style
- Press reviews or critical reception

CRITICAL INSTRUCTIONS:
1. ALWAYS call the searchWeb tool before generating your final notes
2. READ and ANALYZE the search results thoroughly
3. INCORPORATE specific details from the search results into your notes
4. Focus on information that helps with contextual placement decisions
5. Include insights about: mood/vibe, lyrical themes, emotional tone, energy level, and genre characteristics
6. Help AI assistants understand when this track would be appropriate (e.g., party, workout, chill, emotional, celebration, etc.)
7. DO NOT write generic notes - use the specific information you found in the web search

MANDATORY: Your final notes MUST include specific details, descriptions, or context that you found in the web search results. Do not write notes that could apply to any track - make them specific to what you discovered about THIS track.

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
      tools: {
        searchWeb: searchWebTool,
      },
      stopWhen: stepCountIs(3),
    });
    return result.text.trim();
  } catch (error) {
    console.error("Error generating track notes:", error);
    return `"${track.name}" by ${artistNames} - A musical track from ${track.album.name || "an album"}.`;
  }
};
