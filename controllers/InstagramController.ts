import { Request, Response } from "express";
import runApifyActor from "../lib/apify/runApifyActor";

export const getInstagramProfilesHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { handles, webhooks } = req.query;

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
      "apify~instagram-profile-scraper",
      webhooks as string
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
    const { postUrls, webhooks, resultsLimit, isNewestComments } = req.query;

    if (!postUrls) {
      res.status(400).json({
        error: "Missing or invalid postUrls parameter",
      });
      return;
    }

    // Build input object with required and optional params
    const input: Record<string, any> = {
      directUrls: Array.isArray(postUrls) ? postUrls : [postUrls],
      resultsLimit: 100, // default
    };

    // If resultsLimit is provided and is a valid number, override default
    // Only override if the provided limit is a positive number *and* smaller than the current default
    if (resultsLimit !== undefined) {
      const parsedLimit = parseInt(resultsLimit as string, 10);
      const isAcceptableLimit =
        !isNaN(parsedLimit) &&
        parsedLimit > 0 &&
        parsedLimit < input.resultsLimit;
      if (isAcceptableLimit) input.resultsLimit = parsedLimit;
    }

    // If isNewestComments is provided, parse as boolean
    if (isNewestComments !== undefined) {
      input.isNewestComments = isNewestComments === "true";
    }

    const response = await runApifyActor(
      input,
      "apify~instagram-comment-scraper",
      webhooks as string
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
