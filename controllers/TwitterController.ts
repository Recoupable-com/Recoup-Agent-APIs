import { Request, Response } from "express";
import { Scraper, SearchMode } from "agent-twitter-client";
import getAllTweets from "../lib/twitter/getAllTweets";
import getSearchModeEnum from "../lib/twitter/getSearchModeEnum";

/**
 * Handler for /x/search endpoint. Currently only supports Twitter handle as query.
 * TODO: Extend TwitterScraper to support full Twitter search queries and searchMode.
 */
export const searchTweetsHandler = async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const maxTweets = parseInt(req.query.maxTweets as string, 10);
    const searchMode = (req.query.searchMode as string) || "Latest";

    if (!query || isNaN(maxTweets)) {
      return res.status(400).json({
        status: "error",
        message: "Missing required parameters: query, maxTweets",
      });
    }

    // Convert SearchMode enum to array of allowed string values
    const allowedModes = Object.keys(SearchMode).filter((k) =>
      isNaN(Number(k))
    );
    if (!allowedModes.includes(searchMode)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid searchMode. Allowed: ${allowedModes.join(", ")}`,
      });
    }

    const twitterScraper = new Scraper();
    const modeEnum = getSearchModeEnum(searchMode);
    const searchResults = await getAllTweets(
      twitterScraper,
      query,
      maxTweets,
      modeEnum
    );
    return res.json({
      status: "success",
      tweets: searchResults,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: (error as Error).message });
  }
};
