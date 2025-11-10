import runApifyActor from "../apify/runApifyActor.js";
import { OUTSTANDING_ERROR } from "../twitter/errors.js";

interface ApifyRunInfo {
  runId: string;
  datasetId: string;
  error?: string;
}

const startProfileScraping = async (
  handle: string,
  resultsPerPage = 1
): Promise<ApifyRunInfo | null> => {
  const profiles = [handle];
  const input = {
    resultsPerPage,
    proxyCountryCode: "None",
    profiles,
  };

  try {
    const response = await runApifyActor(input, "clockworks~tiktok-scraper");

    if (!response) {
      console.error(
        "Failed to start TikTok profile scraping for handle:",
        handle
      );
      return null;
    }

    const { error, runId, datasetId } = response;
    if (error) {
      throw new Error(OUTSTANDING_ERROR);
    }

    return { runId, datasetId };
  } catch (error) {
    console.error("Error in startProfileScraping:", error);
    throw error;
  }
};

export default startProfileScraping;
