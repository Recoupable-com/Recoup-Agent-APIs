import runApifyActor from "../apify/runApifyActor";

const getPostCommentsDatasetId = async (directUrls: Array<string>) => {
  const input = {
    directUrls,
    resultsLimit: 100,
  };

  try {
    const response = await runApifyActor(
      input,
      "apify~instagram-comment-scraper"
    );
    return response;
  } catch (error) {
    console.error(error);
    throw new Error(error as string);
  }
};

export default getPostCommentsDatasetId;
