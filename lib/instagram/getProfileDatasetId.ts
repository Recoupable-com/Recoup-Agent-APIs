import runApifyActor from "../apify/runApifyActor";
import { OUTSTANDING_ERROR } from "../twitter/errors";

interface ApifyRunInfo {
  runId: string;
  datasetId: string;
  error?: string;
}

const startProfileScraping = async (
  handle: string
): Promise<ApifyRunInfo | null> => {
  const input = {
    usernames: [handle],
  };

  try {
    const response = await runApifyActor(
      input,
      "apify~instagram-profile-scraper"
    );

    if (!response) {
      console.error(
        "Failed to start Instagram profile scraping for handle:",
        handle
      );
      return null;
    }

    const { error, runId, datasetId } = response;
    if (error) throw new Error(OUTSTANDING_ERROR);

    return { runId, datasetId };
  } catch (error) {
    console.error("Error in startProfileScraping:", error);
    return null;
  }
};

export default startProfileScraping;
