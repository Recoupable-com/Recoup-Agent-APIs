import type { RequestHandler } from "express";
import { getArtistSocials } from "../../lib/supabase/getArtistSocials";

/**
 * Handler for GET /artist/socials
 * Retrieves all social media profiles associated with an artist account
 */
export const getArtistSocialsHandler: RequestHandler = async (req, res) => {
  try {
    const { artist_account_id, page, limit } = req.query;

    if (!artist_account_id || typeof artist_account_id !== "string") {
      res.status(400).json({
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
      return;
    }

    const result = await getArtistSocials({
      artist_account_id,
      page: typeof page === "string" ? parseInt(page, 10) : undefined,
      limit: typeof limit === "string" ? parseInt(limit, 10) : undefined,
    });

    const statusCode = result.status === "success" ? 200 : 500;
    res.status(statusCode).json(result);
    return;
  } catch (error) {
    console.error("[ERROR] getArtistSocialsHandler error:", error);

    res.status(500).json({
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
    return;
  }
};
