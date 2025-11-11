import apifyClient from "../apify/client";
import { ApifyRunInfo } from "../apify/types";

const startTwitterProfileScraping = async (
  handle: string
): Promise<ApifyRunInfo | null> => {
  const input = {
    twitterHandles: [handle],
    sort: "Latest",
    maxItems: 1,
  };

  const run = await apifyClient
    .actor("apidojo/twitter-scraper-lite")
    .start(input);

  return {
    runId: run.id,
    datasetId: run.defaultDatasetId,
  };
};

export default startTwitterProfileScraping;
