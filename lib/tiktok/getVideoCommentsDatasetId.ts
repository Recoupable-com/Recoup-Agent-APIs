import runTikTokActor from "../apify/runTikTokActor.js";

interface ApifyRunInfo {
  runId: string;
  datasetId: string;
  error?: string;
}

const startCommentsScraping = async (
  postURLs: string[]
): Promise<ApifyRunInfo | null> => {
  const input = {
    postURLs,
    commentsPerPost: 100,
    maxRepliesPerComment: 0,
  };

  try {
    const response = await runTikTokActor(
      input,
      "clockworks~tiktok-comments-scraper"
    );

    if (!response) {
      console.error("Failed to start TikTok comments scraping");
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
