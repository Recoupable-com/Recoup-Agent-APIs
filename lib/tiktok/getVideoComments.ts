import { Post } from "../../types/agent";
import { ScrapedComment } from "../scraping/types";
import getActorStatus from "../apify/getActorStatus";
import getDataset from "../apify/getDataset";
import getFormattedComments from "./getFormattedComments";
import getVideoCommentsDatasetId from "./getVideoCommentsDatasetId";

const getVideoComments = async (scraping_posts: Post[]) => {
  const postUrls = scraping_posts.map(
    (scraping_post) => scraping_post.post_url
  );
  try {
    const datasetId = await getVideoCommentsDatasetId(postUrls);
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const data = await getDataset(datasetId);
      if (!data?.length) {
        continue;
      }

      const formattedData = getFormattedComments(data, scraping_posts);
      const status = await getActorStatus(datasetId);

      const isFinalAttempt = attempts === maxAttempts - 1;

      if (status === "SUCCEEDED" || isFinalAttempt) {
        return formattedData;
      }
    }

    return [];
  } catch (error) {
    console.error("[ERROR] Failed to get video comments:", error);
    return [];
  }
};

export default getVideoComments;
