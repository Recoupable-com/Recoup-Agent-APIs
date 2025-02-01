import { SearchMode } from "agent-twitter-client";
import { MAX_TWEETS } from "../consts.js";
import processTweetData from "./processTweetData.js";
import path from "path";
import loadCookies from "./loadCookies.js";
import saveCookies from "./saveCookies.js";

export const getAllTweets = async (scraper: any, handle: string) => {
  console.log("getAllTweets");
  console.log("handle", handle);
  console.log("scraper", scraper);
  const allTweets = new Map();
  let previousCount = 0;
  let stagnantBatches = 0;
  const MAX_STAGNANT_BATCHES = 2;
  const username = process.env.TWITTER_USERNAME;
  const password = process.env.TWITTER_PASSWORD;
  const email = process.env.TWITTER_EMAIL;

  const cookies_path = path.join(
    process.cwd(),
    "cookies",
    `${username}_cookies.json`
  );
  console.log("cookies_path", cookies_path);

  try {
    // First try with guest auth
    const searchResults = scraper.searchTweets(
      `to:${handle}`,
      MAX_TWEETS,
      SearchMode.Latest
    );

    // Only attempt login if guest auth fails
    let loginAttempted = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    try {
      for await (const tweet of searchResults) {
        if (tweet && !allTweets.has(tweet.id)) {
          const processedTweet = processTweetData(tweet);
          if (processedTweet) {
            allTweets.set(tweet.id, processedTweet);
          }
        }
      }
    } catch (searchError) {
      // If guest auth fails, try login
      if (!loginAttempted) {
        loginAttempted = true;
        console.log("Guest auth failed, attempting login...");

        // Try to load existing cookies first
        await loadCookies(scraper, cookies_path);
        let isLoggedIn = await scraper.isLoggedIn();

        while (!isLoggedIn && retryCount < MAX_RETRIES) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Add delay between attempts
            await scraper.login(username, password, email);
            isLoggedIn = await scraper.isLoggedIn();
            if (isLoggedIn) {
              await saveCookies(scraper, cookies_path);
              console.log("Login successful");

              // Retry search with authenticated client
              const authSearchResults = scraper.searchTweets(
                `to:${handle}`,
                MAX_TWEETS,
                SearchMode.Latest
              );

              for await (const tweet of authSearchResults) {
                if (tweet && !allTweets.has(tweet.id)) {
                  const processedTweet = processTweetData(tweet);
                  if (processedTweet) {
                    allTweets.set(tweet.id, processedTweet);
                  }
                }
              }
              break;
            }
          } catch (loginError) {
            console.error(
              `Login attempt ${retryCount + 1} failed:`,
              loginError
            );
            retryCount++;
          }
        }
      }
    }

    return Array.from(allTweets.values());
  } catch (error) {
    console.error("Fatal error in getAllTweets:", error);
    throw error;
  }
};

export default getAllTweets;
