import { Request, Response } from "express";
import { getArtists } from "../../lib/artists/getArtists";

/**
 * Handles GET requests for artists list
 * Returns all artists from the accounts table
 */
export const getArtistsProHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const response = await getArtists();

    if (response.status === "error") {
      res.status(500).json(response);
      return;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("[ERROR] Error in getArtistsProHandler:", error);
    res.status(500).json({
      status: "error",
      artists: [],
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};
