import { Request, Response } from "express";
import { getArtistSegments } from "../lib/supabase/getArtistSegments";

export const getArtistSegmentsHandler = async (req: Request, res: Response) => {
  try {
    const { artist_account_id, page, limit } = req.query;

    // Validate required artist_account_id parameter
    if (!artist_account_id || typeof artist_account_id !== "string") {
      return res.status(400).json({
        status: "error",
        message: "artist_account_id is required and must be a string",
        segments: [],
        pagination: {
          total_count: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
        },
      });
    }

    // Call the service function
    const result = await getArtistSegments({
      artist_account_id,
      page: typeof page === "string" ? parseInt(page, 10) : undefined,
      limit: typeof limit === "string" ? parseInt(limit, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error("[ERROR] Error in getArtistSegmentsHandler:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      segments: [],
      pagination: {
        total_count: 0,
        page: 1,
        limit: 20,
        total_pages: 0,
      },
    });
  }
};
