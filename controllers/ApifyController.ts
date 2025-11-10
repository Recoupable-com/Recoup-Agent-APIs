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
      res.status(400).json({ error: "Missing or invalid runId parameter" });
      return;
    }

    // Get the current status of the run
    const { status, datasetId } = await getActorStatus(runId);

    let statusCode = 200;
    let payload: {
      status: string;
      datasetId: string | null;
      data?: unknown[];
    } = {
      status,
      datasetId: datasetId ?? null,
    };

    if (status === "SUCCEEDED") {
      if (!datasetId) {
        statusCode = 500;
      } else {
        const results = await getDataset(datasetId);
        if (!results) {
          statusCode = 500;
        } else {
          payload = { status, datasetId, data: results };
        }
      }
    } else if (status === "FAILED" || status === "ABORTED") {
      statusCode = 500;
    }

    res.status(statusCode).json(payload);
  } catch (error) {
    console.error("Error in getScraperResultsHandler:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
