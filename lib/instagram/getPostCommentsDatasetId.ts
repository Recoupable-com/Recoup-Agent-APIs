import runTikTokActor from "../apify/runTikTokActor";

const getPostCommentsDatasetId = async (directUrls: Array<string>) => {
  const input = {
    directUrls,
    resultsLimit: 100,
  };

  try {
    const defaultDatasetId = await runTikTokActor(
      input,
      "apify~instagram-comment-scraper",
    );
    return defaultDatasetId;
  } catch (error) {
    console.error(error);
    throw new Error(error as string);
  }
};

export default getPostCommentsDatasetId;
