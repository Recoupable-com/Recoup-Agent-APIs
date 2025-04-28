import { Request, Response } from "express";
import { getSocialPostsNew } from "../lib/supabase/getSocialPostsNew";

/**
 * Handler for GET /api/social/posts
 * Retrieves all social media posts from a specific social profile
 */
export const getSocialPostsHandler = async (req: Request, res: Response) => {
  try {
    // Get query parameters
    const { social_id, latestFirst, page, limit } = req.query;

    // Validate required parameters
    if (!social_id || typeof social_id !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Missing required parameter: social_id",
        posts: [],
        pagination: {
          total_count: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
        },
      });
    }

    // Parse optional parameters
    const parsedLatestFirst = latestFirst !== "false"; // Default to true if not explicitly set to false
    const parsedPage =
      typeof page === "string" ? Math.max(parseInt(page, 10), 1) : 1;
    const parsedLimit =
      typeof limit === "string"
        ? Math.min(Math.max(parseInt(limit, 10), 1), 100)
        : 20; // Between 1 and 100, default 20

    // Call database function
    const result = await getSocialPostsNew({
      social_id,
      latestFirst: parsedLatestFirst,
      page: parsedPage,
      limit: parsedLimit,
    });

    // Return response
    return res.status(result.status === "success" ? 200 : 500).json(result);
  } catch (error) {
    console.error("[ERROR] getSocialPostsHandler error:", error);

    return res.status(500).json({
      status: "error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      posts: [],
      pagination: {
        total_count: 0,
        page: 1,
        limit: 20,
        total_pages: 0,
      },
    });
  }
};
