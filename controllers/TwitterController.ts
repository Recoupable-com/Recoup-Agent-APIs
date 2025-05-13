import { Request, Response } from "express";
import { Scraper, SearchMode, Tweet } from "agent-twitter-client";
import processTweetData from "../lib/twitter/processTweetData";
import getAllTweets from "../lib/twitter/getAllTweets";

// Utility to map string to SearchMode enum value
const getSearchModeEnum = (mode: string): SearchMode | undefined => {
  switch (mode) {
    case "Top":
      return SearchMode.Top;
    case "Latest":
      return SearchMode.Latest;
    case "Photos":
      return SearchMode.Photos;
    case "Videos":
      return SearchMode.Videos;
    case "Users":
      return SearchMode.Users;
    default:
      return undefined;
  }
};

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
    const allTweets = new Map();

    const modeEnum = getSearchModeEnum(searchMode);

    console.log("modeEnum", modeEnum);

    const searchResults = await getAllTweets(
      twitterScraper,
      query,
      maxTweets,
      modeEnum
    );
    console.log("searchResults", searchResults);
    return res.json({
      status: "success",
      tweets: searchResults,
      pagination: {
        total_count: searchResults.length,
        maxTweets,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: (error as Error).message });
  }
};
