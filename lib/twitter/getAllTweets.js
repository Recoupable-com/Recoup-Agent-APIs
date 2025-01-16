import { SearchMode } from "agent-twitter-client";
import { MAX_TWEETS } from "../consts.js";
import processTweetData from "./processTweetData.js";
import path from "path";
import loadCookies from "./loadCookies.js";
import saveCookies from "./saveCookies.js";

export const getAllTweets = async (scraper, handle) => {
  const allTweets = new Map();
  let previousCount = 0;
  let stagnantBatches = 0;
  const MAX_STAGNANT_BATCHES = 2;
  const username = process.env.TWITTER_USERNAME;
  const password = process.env.TWITTER_PASSWORD;
  const email = process.env.TWITTER_EMAIL;

  console.log("ZIAD", username, password, email)
  const cookies_path = path.join(
    process.cwd(),
    "cookies",
    `${username}_cookies.json`,
  );

  try {
    await loadCookies(scraper, cookies_path);
    const isLoggedIn = await scraper.isLoggedIn();
    if (!isLoggedIn) {
      await scraper.login(username, password, email);
      const isNewLoggedIn = await scraper.isLoggedIn();
      if (isNewLoggedIn) await saveCookies(scraper, cookies_path);
    }

    const searchResults = scraper.searchTweets(
      `to:${handle}`,
      MAX_TWEETS,
      SearchMode.Latest,
    );

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
    return { error };
  }
};

export default getAllTweets;
