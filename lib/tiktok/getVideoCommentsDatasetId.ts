import runTikTokActor from "../apify/runTikTokActor.js";

const getVideoCommentsDatasetId = async (postURLs: any) => {
  const input = {
    postURLs,
    commentsPerPost: 100,
    maxRepliesPerComment: 0,
  };

  try {
    const defaultDatasetId = await runTikTokActor(
      input,
      "clockworks~tiktok-comments-scraper",
    );
    return defaultDatasetId;
  } catch (error) {
    console.error(error);
    throw new Error(error as string);
  }
};

export default getVideoCommentsDatasetId;
