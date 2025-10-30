import { Request, Response } from "express";
import { processSongsInput } from "../lib/songs/processSongsInput";
import { getSongsWithArtists } from "../lib/songs/getSongsWithArtists";
import { TablesInsert } from "../types/database.types";
import { formatSongsInput, SongInput } from "../lib/songs/formatSongsInput";

type CreateSongsRequest = {
  songs: SongInput[];
};

/**
 * Retrieves songs from the database with optional filtering by ISRC or artist account.
 *
 * Parameters:
 * - isrc (optional): International Standard Recording Code to filter by specific song
 * - artist_account_id (optional): Artist account ID to filter songs by artist
 *
 * Returns songs with associated artist information.
 */
export const getSongsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { isrc, artist_account_id } = req.query;

    // Prepare parameters for the query
    const isrcs = isrc && typeof isrc === "string" ? [isrc] : undefined;
    const artistAccountIds =
      artist_account_id && typeof artist_account_id === "string"
        ? [artist_account_id]
        : undefined;

    // Get songs with artist information
    const response = await getSongsWithArtists(isrcs, artistAccountIds);
    res.json(response);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

/**
 * Creates or updates songs and links them to artist accounts.
 *
 * Behavior:
 * - Upserts songs based on ISRC (inserts if new, updates if exists)
 * - Links songs to the specified artist accounts
 * - Optional fields (name, album, notes) are applied only if internal search cannot find valid info for the provided ISRC
 * - Returns the created/updated songs with artist information
 */
export const createSongsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const body = req.body as { songs: SongInput[] };

    // Validate request body
    if (!body.songs || !Array.isArray(body.songs) || body.songs.length === 0) {
      res.status(400).json({
        status: "error",
        error: "songs array is required and must not be empty",
      });
      return;
    }

    // Validate all songs have required fields
    const invalidSongs = body.songs.filter((song) => !song.isrc);
    if (invalidSongs.length > 0) {
      res.status(400).json({
        status: "error",
        error: "isrc is required for each song",
      });
      return;
    }

    const { songsForUpsert, artistsByIsrc } = formatSongsInput(body.songs);

    // Process songs (upsert and link to artists) with fallback artists
    await processSongsInput(songsForUpsert, artistsByIsrc);

    // Get unique ISRCs from the processed songs
    const uniqueIsrcs = [...new Set(body.songs.map((song) => song.isrc))];

    // Return the created/updated songs with artist information
    const response = await getSongsWithArtists(uniqueIsrcs);
    res.json(response);
  } catch (error) {
    console.error("Error creating songs:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
