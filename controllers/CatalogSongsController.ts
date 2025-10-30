import { Request, Response } from "express";
import { TablesInsert, Tables } from "../types/database.types";
import { insertCatalogSongs } from "../lib/supabase/catalog_songs/insertCatalogSongs";
import { selectCatalogSongsWithArtists } from "../lib/supabase/catalog_songs/selectCatalogSongsWithArtists";
import { deleteCatalogSongs } from "../lib/supabase/catalog_songs/deleteCatalogSongs";
import { processSongsInput } from "../lib/songs/processSongsInput";
import { SongInput } from "../lib/songs/formatSongsInput";

type CatalogSongInput = {
  catalog_id: string;
  isrc: string;
  name?: string;
  album?: string;
  notes?: string;
  artists?: string[];
};

type CreateCatalogSongsRequest = {
  songs: CatalogSongInput[];
};

type DeleteCatalogSongsRequest = {
  songs: CatalogSongInput[];
};

/**
 * Creates catalog-song relationships by adding songs to catalogs.
 *
 * Behavior:
 * - Creates relationships in catalog_songs table for each {catalog_id, isrc} pair
 * - If either catalog_id or isrc is missing in any item, an error is returned
 * - Request accepts a bulk array under songs
 * - Returns the created catalog songs with artist information
 */
export const createCatalogSongsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const body = req.body as CreateCatalogSongsRequest;

    // Validate request body
    if (!body.songs || !Array.isArray(body.songs) || body.songs.length === 0) {
      res.status(400).json({
        status: "error",
        error: "songs array is required and must not be empty",
      });
      return;
    }

    // Validate all songs have required fields
    const invalidSongs = body.songs.filter(
      (song) => !song.catalog_id || !song.isrc
    );
    if (invalidSongs.length > 0) {
      res.status(400).json({
        status: "error",
        error: "catalog_id and isrc are required for each song",
      });
      return;
    }

    // Get unique ISRCs and create song records with CSV data preserved
    const dataByIsrc = body.songs.reduce((map, song) => {
      if (song.isrc) {
        map.set(song.isrc, {
          name: song.name || "",
          album: song.album || "",
          notes: song.notes || "",
          artists: Array.isArray(song.artists) ? song.artists : undefined,
        });
      }
      return map;
    }, new Map<string, { name: string; album: string; notes: string; artists?: string[] }>());

    // Convert to SongInput format for processSongsInput
    const songsToProcess: SongInput[] = Array.from(dataByIsrc.entries()).map(
      ([isrc, csvData]) => ({
        isrc,
        ...csvData,
      })
    );

    await processSongsInput(songsToProcess);

    // Insert catalog_songs relationships
    await insertCatalogSongs(
      body.songs.map((song) => ({
        catalog: song.catalog_id,
        song: song.isrc,
      }))
    );

    // Get unique catalog IDs for fetching the created relationships
    const uniqueCatalogIds = [
      ...new Set(body.songs.map((song) => song.catalog_id)),
    ];

    // Fetch the created catalog songs with artist information
    const result = await selectCatalogSongsWithArtists({
      isrcs: Array.from(dataByIsrc.keys()),
    });

    // Filter to only include songs from the catalogs we just added to
    const filteredCatalogSongs = result.songs.filter((catalogSong) =>
      uniqueCatalogIds.includes(catalogSong.catalog_id)
    );

    res.json({
      status: "success",
      songs: filteredCatalogSongs,
    });
  } catch (error) {
    console.error("Error creating catalog songs:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

/**
 * Retrieves catalog songs with pagination.
 *
 * Parameters:
 * - catalog_id (required): The unique identifier of the catalog to query songs for
 * - artistName (optional): Filter songs by artist name
 * - page (optional): Page number for pagination (default: 1)
 * - limit (optional): Number of songs per page (default: 20, max: 100)
 *
 * Returns songs with associated artist information and pagination metadata.
 */
export const getCatalogSongsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { catalog_id, artistName, page, limit } = req.query;

    // Validate required catalog_id parameter
    if (!catalog_id || typeof catalog_id !== "string") {
      res.status(400).json({
        status: "error",
        error: "catalog_id parameter is required",
      });
      return;
    }

    // Parse and validate pagination parameters
    const pageNum = page ? parseInt(page as string, 10) : 1;
    const limitNum = limit ? parseInt(limit as string, 10) : 20;

    if (isNaN(pageNum) || pageNum < 1) {
      res.status(400).json({
        status: "error",
        error: "page must be a positive integer",
      });
      return;
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({
        status: "error",
        error: "limit must be a positive integer between 1 and 100",
      });
      return;
    }

    // Fetch catalog songs with pagination
    const result = await selectCatalogSongsWithArtists({
      catalogId: catalog_id,
      artistName:
        artistName && typeof artistName === "string" ? artistName : undefined,
      page: pageNum,
      limit: limitNum,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(result.total_count / limitNum);

    res.json({
      status: "success",
      songs: result.songs,
      pagination: {
        total_count: result.total_count,
        page: pageNum,
        limit: limitNum,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching catalog songs:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

/**
 * Deletes catalog-song relationships by removing songs from catalogs.
 *
 * Behavior:
 * - Deletes relationships in catalog_songs table for each {catalog_id, isrc} pair
 * - If either catalog_id or isrc is missing in any item, an error is returned
 * - Request accepts a bulk array under songs
 * - Response structure is identical to GET and POST (songs array with pagination when applicable)
 */
export const deleteCatalogSongsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const body = req.body as DeleteCatalogSongsRequest;

    // Validate request body
    if (!body.songs || !Array.isArray(body.songs) || body.songs.length === 0) {
      res.status(400).json({
        status: "error",
        error: "songs array is required and must not be empty",
      });
      return;
    }

    // Validate all songs have required fields
    const invalidSongs = body.songs.filter(
      (song) => !song.catalog_id || !song.isrc
    );
    if (invalidSongs.length > 0) {
      res.status(400).json({
        status: "error",
        error: "catalog_id and isrc are required for each song",
      });
      return;
    }

    // Delete catalog_songs relationships
    const affectedCatalogIds = await deleteCatalogSongs(body.songs);

    // Get unique catalog IDs for fetching the remaining relationships
    const uniqueCatalogIds = [...new Set(affectedCatalogIds)];

    // Fetch the remaining catalog songs with artist information for the affected catalogs
    const remainingCatalogSongs = [];

    for (const catalogId of uniqueCatalogIds) {
      const result = await selectCatalogSongsWithArtists({
        catalogId,
      });
      remainingCatalogSongs.push(...result.songs);
    }

    res.json({
      status: "success",
      songs: remainingCatalogSongs,
    });
  } catch (error) {
    console.error("Error deleting catalog songs:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
