import { Post } from "../../types/agent";
import getActorStatus from "../apify/getActorStatus";
import getDataset from "../apify/getDataset";
import getFormattedComments from "./getFormattedComments";
import getPostCommentsDatasetId from "./getPostCommentsDatasetId";

const getPostComments = async (scraping_posts: Post[]) => {
  const postUrls = scraping_posts.map(
    (scraping_post) => scraping_post.post_url
  );
  try {
    const datasetId = await getPostCommentsDatasetId(postUrls);
    let attempts = 0;
    const maxAttempts = 30;
    let progress = 0;
    while (1) {
      attempts++;
      progress = (attempts / maxAttempts) * 100;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const data = await getDataset(datasetId);
      const formattedData = getFormattedComments(data, scraping_posts);
      const status = await getActorStatus(datasetId);
      if (status === "SUCCEEDED" || progress > 95) return formattedData;
    }
    return [];
  } catch (error) {
    return [];
  }
};

export default getPostComments;
