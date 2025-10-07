import { Request, Response } from "express";
import { TablesInsert } from "../types/database.types";
import { insertCatalogSongs } from "../lib/supabase/catalog_songs/insertCatalogSongs";
import { selectCatalogSongsWithArtists } from "../lib/supabase/catalog_songs/selectCatalogSongsWithArtists";

type CatalogSongInput = {
  catalog_id: string;
  isrc: string;
};

type CreateCatalogSongsRequest = {
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

    // Prepare catalog_songs data for insertion
    const catalogSongsData: TablesInsert<"catalog_songs">[] = body.songs.map(
      (song) => ({
        catalog: song.catalog_id,
        song: song.isrc,
      })
    );

    // Insert catalog_songs relationships
    await insertCatalogSongs(catalogSongsData);

    // Get unique catalog IDs and ISRCs for fetching the created relationships
    const uniqueCatalogIds = [
      ...new Set(body.songs.map((song) => song.catalog_id)),
    ];
    const uniqueIsrcs = [...new Set(body.songs.map((song) => song.isrc))];

    // Fetch the created catalog songs with artist information
    const catalogSongs = await selectCatalogSongsWithArtists({
      isrcs: uniqueIsrcs,
    });

    // Filter to only include songs from the catalogs we just added to
    const filteredCatalogSongs = catalogSongs.filter((catalogSong) =>
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
