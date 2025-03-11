import runTikTokActor from "../apify/runTikTokActor";

interface ApifyRunInfo {
  runId: string;
  datasetId: string;
  error?: string;
}

const startCommentsScraping = async (
  directUrls: Array<string>
): Promise<ApifyRunInfo | null> => {
  const input = {
    directUrls,
    resultsLimit: 100,
  };

  try {
    const response = await runTikTokActor(
      input,
      "apify~instagram-comment-scraper"
    );

    if (!response) {
      console.error("Failed to start Instagram comments scraping");
      return null;
    }

    const { error, runId, datasetId } = response;
    if (error) {
      throw new Error(error);
    }

    return { runId, datasetId };
  } catch (error) {
    console.error("Error in startCommentsScraping:", error);
    throw error;
  }
};

export default startCommentsScraping;
