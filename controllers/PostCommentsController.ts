import { Request, Response } from "express";
import getPostCommentsNew from "../lib/supabase/getPostCommentsNew";

/**
 * Handler for GET /api/post/comments
 * Retrieves comments for a specific social media post
 */
export const getPostCommentsHandler = async (req: Request, res: Response) => {
  try {
    // Get query parameters
    const { post_id, page, limit } = req.query;

    // Validate required parameters
    if (!post_id || typeof post_id !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Missing required parameter: post_id",
        comments: [],
        pagination: {
          total_count: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
        },
      });
    }

    // Parse optional parameters
    const parsedPage =
      typeof page === "string" ? Math.max(parseInt(page, 10), 1) : 1;
    const parsedLimit =
      typeof limit === "string"
        ? Math.min(Math.max(parseInt(limit, 10), 1), 100)
        : 20; // Between 1 and 100, default 20

    // Call database function
    const result = await getPostCommentsNew({
      post_id,
      page: parsedPage,
      limit: parsedLimit,
    });

    // Return response
    return res.status(result.status === "success" ? 200 : 500).json(result);
  } catch (error) {
    console.error("[ERROR] getPostCommentsHandler error:", error);

    return res.status(500).json({
      status: "error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      comments: [],
      pagination: {
        total_count: 0,
        page: 1,
        limit: 20,
        total_pages: 0,
      },
    });
  }
};
