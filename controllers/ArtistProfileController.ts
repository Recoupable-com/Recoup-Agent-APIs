import { Request, Response } from "express";
import { getArtistProfile } from "../lib/artist-profile/getArtistProfile";
import { createErrorResponse } from "../lib/artist-profile/artistProfileUtils";

/**
 * Handles GET requests for artist profile information
 * Requires query parameter: artist_account_id
 */
export const getArtistProfileHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { artist_account_id } = req.query;

    if (!artist_account_id || typeof artist_account_id !== "string") {
      res
        .status(400)
        .json(
          createErrorResponse("artist_account_id query parameter is required")
        );
      return;
    }

    const response = await getArtistProfile(artist_account_id);

    if (response.status === "error") {
      res.status(500).json(response);
      return;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("[ERROR] Error in getArtistProfileHandler:", error);
    res
      .status(500)
      .json(
        createErrorResponse(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        )
      );
  }
};
