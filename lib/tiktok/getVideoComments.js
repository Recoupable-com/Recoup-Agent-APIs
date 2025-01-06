import getActorStatus from "../apify/getActorStatus.js";
import getDataset from "../apify/getDataset.js";
import { STEP_OF_ANALYSIS } from "../step.js";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus.js";
import getFormattedComments from "./getFormattedComments.js";
import getVideoCommentsDatasetId from "./getVideoCommentsDatasetId.js";

const getVideoComments = async (postURLs, chat_id, analysisId) => {
  try {
    const datasetId = await getVideoCommentsDatasetId(postURLs);
    let attempts = 0;
    const maxAttempts = 30;
    let progress = 0;
    while (1) {
      attempts++;
      progress = (attempts / maxAttempts) * 100;
      if (progress < 20)
        await updateAnalysisStatus(
          chat_id,
          analysisId,
          STEP_OF_ANALYSIS.POSTURLS,
          progress,
          "tiktok",
        );
      if (progress > 20)
        await updateAnalysisStatus(
          chat_id,
          analysisId,
          STEP_OF_ANALYSIS.POST_COMMENTS,
          progress,
          "tiktok",
        );
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const data = await getDataset(datasetId);
      const formattedData = getFormattedComments(data, analysisId);
      const status = await getActorStatus(datasetId);
      if (status === "SUCCEEDED" || progress > 95) return formattedData;
    }
  } catch (error) {
    throw new Error(error);
  }
};

export default getVideoComments;
