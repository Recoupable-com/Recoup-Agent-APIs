import { Request, Response } from "express";
import { getSegmentFans } from "../lib/supabase/getSegmentFans";

export const getSegmentFansHandler = async (req: Request, res: Response) => {
  try {
    const { segment_id, page, limit } = req.query;

    if (!segment_id || typeof segment_id !== "string") {
      return res.status(400).json({
        status: "error",
        message: "segment_id is required and must be a string",
        fans: [],
        pagination: {
          total_count: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
        },
      });
    }

    const result = await getSegmentFans({
      segment_id,
      page: typeof page === "string" ? parseInt(page, 10) : undefined,
      limit: typeof limit === "string" ? parseInt(limit, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error("[ERROR] Error in getSegmentFansHandler:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      fans: [],
      pagination: {
        total_count: 0,
        page: 1,
        limit: 20,
        total_pages: 0,
      },
    });
  }
};
