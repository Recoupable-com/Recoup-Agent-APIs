import { SearchMode } from "agent-twitter-client";
import { MAX_TWEETS } from "../consts.js";
import processTweetData from "./processTweetData.js";
import { verifyLoggedIn } from "./verifyLoggedIn.js";

export const getAllTweets = async (
  scraper: any,
  query: string,
  maxTweets = MAX_TWEETS,
  searchMode = SearchMode.Latest
) => {
  const allTweets = new Map();
  let previousCount = 0;
  let stagnantBatches = 0;
  const MAX_STAGNANT_BATCHES = 2;

  try {
    await verifyLoggedIn(scraper);

    const searchResults = scraper.searchTweets(query, maxTweets, searchMode);

    for await (const tweet of searchResults) {
      if (tweet && !allTweets.has(tweet.id)) {
        const processedTweet = processTweetData(tweet);
        if (processedTweet) {
          allTweets.set(tweet.id, processedTweet);

          if (allTweets.size % 100 === 0) {
            if (allTweets.size === previousCount) {
              stagnantBatches++;
              if (stagnantBatches >= MAX_STAGNANT_BATCHES) {
                break;
              }
            } else {
              stagnantBatches = 0;
            }
            previousCount = allTweets.size;
          }
        }
      }
    }
    return Array.from(allTweets.values());
  } catch (error) {
    return [];
  }
};

export default getAllTweets;
