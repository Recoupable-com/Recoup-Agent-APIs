import { Request, Response } from "express";
import { getArtistComments } from "../lib/supabase/getArtistComments";

export const getCommentsHandler = async (req: Request, res: Response) => {
  try {
    const { artist_account_id, post_id, page, limit } = req.query;

    if (!artist_account_id || typeof artist_account_id !== "string") {
      return res.status(400).json({
        status: "error",
        message: "artist_account_id is required and must be a string",
      });
    }

    const result = await getArtistComments({
      artist_account_id,
      post_id: typeof post_id === "string" ? post_id : undefined,
      page: typeof page === "string" ? parseInt(page, 10) : undefined,
      limit: typeof limit === "string" ? parseInt(limit, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error("[ERROR] Error in getCommentsHandler:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
