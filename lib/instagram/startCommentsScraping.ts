import runApifyActor from "../apify/runApifyActor";

interface ApifyRunInfo {
  runId: string;
  datasetId: string;
  error?: string;
}

const startCommentsScraping = async (
  directUrls: Array<string>
): Promise<ApifyRunInfo | null> => {
  console.log(
    "[DEBUG] Starting Instagram comments scraping for",
    directUrls.length,
    "posts"
  );

  const input = {
    directUrls,
    resultsLimit: 10000,
  };

  try {
    const response = await runApifyActor(
      input,
      "apify~instagram-comment-scraper"
    );

    if (!response) {
      console.error("[ERROR] Failed to start Instagram comments scraping");
      return null;
    }

    const { error, runId, datasetId } = response;
    if (error) {
      console.error("[ERROR] Apify actor error:", error);
      throw new Error(error);
    }

    console.log("[DEBUG] Successfully started Instagram comments scraping:", {
      runId,
      datasetId,
      postCount: directUrls.length,
    });

    return { runId, datasetId };
  } catch (error) {
    console.error("[ERROR] Error in startCommentsScraping:", error);
    throw error;
  }
};

export default startCommentsScraping;
