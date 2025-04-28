import { Request, Response } from "express";
import { getArtistSocials } from "../lib/supabase/getArtistSocials";

/**
 * Handler for GET /api/artist/socials
 * Retrieves all social media profiles associated with an artist account
 */
export const getArtistSocialsHandler = async (req: Request, res: Response) => {
  try {
    // Get query parameters
    const { artist_account_id, page, limit } = req.query;

    // Validate required parameters
    if (!artist_account_id || typeof artist_account_id !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Missing required parameter: artist_account_id",
        socials: [],
        pagination: {
          total_count: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
        },
      });
    }

    // Call the database function with parameters
    const result = await getArtistSocials({
      artist_account_id,
      page: typeof page === "string" ? parseInt(page, 10) : undefined,
      limit: typeof limit === "string" ? parseInt(limit, 10) : undefined,
    });

    // Return the response
    return res.status(result.status === "success" ? 200 : 500).json(result);
  } catch (error) {
    console.error("[ERROR] getArtistSocialsHandler error:", error);

    return res.status(500).json({
      status: "error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      socials: [],
      pagination: {
        total_count: 0,
        page: 1,
        limit: 20,
        total_pages: 0,
      },
    });
  }
};
