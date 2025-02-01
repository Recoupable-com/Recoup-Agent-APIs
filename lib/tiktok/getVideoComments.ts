import { Post } from "../../types/agent";
import { Database } from "../../types/database.types";
import getActorStatus from "../apify/getActorStatus";
import getDataset from "../apify/getDataset";
import { STEP_OF_AGENT } from "../step";
import updateAgentStatus from "../supabase/updateAgentStatus";
import getFormattedComments from "./getFormattedComments";
import getVideoCommentsDatasetId from "./getVideoCommentsDatasetId";

const getVideoComments = async (
  agent_status_id: string | any,
  scraping_posts: Post[],
) => {
  const postUrls = scraping_posts.map(
    (scraping_post) => scraping_post.post_url,
  );
  try {
    const datasetId = await getVideoCommentsDatasetId(postUrls);
    let attempts = 0;
    const maxAttempts = 30;
    let progress = 0;
    while (1) {
      attempts++;
      progress = (attempts / maxAttempts) * 100;
      await updateAgentStatus(
        agent_status_id,
        STEP_OF_AGENT.POST_COMMENTS,
        progress,
      );
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

export default getVideoComments;
