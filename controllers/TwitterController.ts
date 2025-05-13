import { Request, Response } from "express";
import { Scraper, SearchMode } from "agent-twitter-client";
import getAllTweets from "../lib/twitter/getAllTweets";
import getSearchModeEnum from "../lib/twitter/getSearchModeEnum";
import { getTrends } from "../lib/twitter/getTrends";

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

    const modeEnum = getSearchModeEnum(searchMode);
    if (!modeEnum) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid searchMode. Allowed: Top, Latest, Photos, Videos, Users",
      });
    }

    const twitterScraper = new Scraper();
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

export const getTrendsHandler = async (req: Request, res: Response) => {
  try {
    const scraper = new Scraper();
    const trends = await getTrends(scraper);
    return res.json({ status: "success", trends });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: (error as Error).message });
  }
};
