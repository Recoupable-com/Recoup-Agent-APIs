import apifyClient from "../apify/client";

interface ApifyRunInfo {
  runId: string;
  datasetId: string;
  error?: string;
  data?: unknown;
}

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
    .call(input);

  return {
    runId: run.id,
    datasetId: run.defaultDatasetId,
  };
};

export default startTwitterProfileScraping;

