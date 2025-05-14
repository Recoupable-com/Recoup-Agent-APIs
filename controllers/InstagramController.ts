import { Request, Response } from "express";
import runApifyActor from "../lib/apify/runApifyActor";

export const getInstagramProfilesHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { handles } = req.query;

    if (!handles) {
      return res.status(400).json({
        error: "handles parameter is required",
      });
    }

    // Convert handles to array if it's a single string
    const handlesArray = Array.isArray(handles) ? handles : [handles];

    // Clean and validate handles
    const cleanHandles = handlesArray.map((handle) => {
      const clean = String(handle).trim().replace(/^@/, "");
      if (!clean) {
        throw new Error("Invalid Instagram handle");
      }
      return clean;
    });

    const runInfo = await runApifyActor(
      { usernames: cleanHandles },
      "apify~instagram-profile-scraper"
    );

    if (!runInfo) {
      return res.status(500).json({
        error: "Failed to start Apify actor",
      });
    }

    return res.json({
      error: runInfo.error || null,
      ...runInfo.data.data,
    });
  } catch (error) {
    console.error("Error fetching Instagram profiles:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const getInstagramCommentsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postUrls } = req.query;

    if (!postUrls || !Array.isArray(postUrls) || postUrls.length === 0) {
      res.status(400).json({
        error: "Missing or invalid postUrls parameter",
      });
      return;
    }

    const input = {
      directUrls: postUrls,
      resultsLimit: 10000,
    };

    const response = await runApifyActor(
      input,
      "apify~instagram-comment-scraper"
    );

    if (!response) {
      res.status(500).json({
        error: "Failed to start Apify actor",
      });
      return;
    }

    res.json({
      runId: response.runId,
      datasetId: response.datasetId,
      error: null,
    });
  } catch (error) {
    console.error("Error in getInstagramCommentsHandler:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
