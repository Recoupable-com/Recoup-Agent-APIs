import { Request, Response } from "express";
import getActorStatus from "../lib/apify/getActorStatus";
import getDataset from "../lib/apify/getDataset";

export const getScraperResultsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { runId } = req.query;

    if (!runId || typeof runId !== "string") {
      res.status(400).json({
        error: "Missing or invalid runId parameter",
      });
      return;
    }

    // Get the current status of the run
    const { status, datasetId } = await getActorStatus(runId);

    // If the run is still in progress, return the status
    if (status === "RUNNING" || status === "PENDING") {
      res.json({
        status,
        datasetId,
      });
      return;
    }

    // If the run failed, return an error
    if (status === "FAILED" || status === "ABORTED") {
      res.status(500).json({
        error: `Scraper run failed with status: ${status}`,
      });
      return;
    }

    // If the run succeeded, get and return the dataset
    if (status === "SUCCEEDED" && datasetId) {
      const results = await getDataset(datasetId);
      if (!results) {
        res.status(500).json({
          error: "Failed to fetch dataset results",
        });
        return;
      }
      res.json(results);
      return;
    }

    // If we get here, something unexpected happened
    res.status(500).json({
      error: `Unexpected status: ${status}`,
    });
  } catch (error) {
    console.error("Error in getScraperResultsHandler:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
