import { Request, Response } from "express";
import { Scraper, SearchMode } from "agent-twitter-client";
import getAllTweets from "../lib/twitter/getAllTweets";
import getSearchModeEnum from "../lib/twitter/getSearchModeEnum";
import { getTrends } from "../lib/twitter/getTrends";
import setNewPosts from "../lib/supabase/setNewPosts";
import connectTweetsToSocial from "../lib/twitter/connectTweetsToSocial";

const twitterScraper = new Scraper();

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

    const searchResults = await getAllTweets(
      twitterScraper,
      query,
      maxTweets,
      modeEnum
    );

    // Store the scraped posts
    const { data: storedPosts, error: storeError } = await setNewPosts(
      searchResults.map((tweet) => tweet.permanentUrl)
    );

    if (storeError) {
      console.error("Error storing tweets:", storeError);
      // Continue with the response even if storage fails
    }

    // Connect tweets to social records
    if (storedPosts) {
      await connectTweetsToSocial(
        storedPosts,
        searchResults.map((tweet) => ({
          username: tweet.username,
          url: tweet.permanentUrl,
        }))
      );
    }

    return res.json({
      status: "success",
      tweets: searchResults,
    });
  } catch (error) {
    console.error("Error in searchTweetsHandler:", error);
    return res
      .status(500)
      .json({ status: "error", message: (error as Error).message });
  }
};

export const getTrendsHandler = async (req: Request, res: Response) => {
  try {
    const trends = await getTrends(twitterScraper);
    return res.json({ status: "success", trends });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: (error as Error).message });
  }
};
