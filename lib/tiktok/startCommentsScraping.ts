import runApifyActor from "../apify/runApifyActor.js";

interface ApifyRunInfo {
  runId: string;
  datasetId: string;
  error?: string;
}

const startCommentsScraping = async (
  postURLs: string[]
): Promise<ApifyRunInfo | null> => {
  console.log(
    "[DEBUG] Starting TikTok comments scraping for",
    postURLs.length,
    "posts"
  );

  const input = {
    postURLs,
    commentsPerPost: 10000,
    maxRepliesPerComment: 0,
  };

  try {
    const response = await runApifyActor(
      input,
      "clockworks~tiktok-comments-scraper"
    );

    if (!response) {
      console.error("[ERROR] Failed to start TikTok comments scraping");
      return null;
    }

    const { error, runId, datasetId } = response;
    if (error) {
      console.error("[ERROR] Apify actor error:", error);
      throw new Error(error);
    }

    console.log("[DEBUG] Successfully started TikTok comments scraping:", {
      runId,
      datasetId,
      postCount: postURLs.length,
    });

    return { runId, datasetId };
  } catch (error) {
    console.error("[ERROR] Error in startCommentsScraping:", error);
    throw error;
  }
};

export default startCommentsScraping;
