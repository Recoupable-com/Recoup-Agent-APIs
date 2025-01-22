import { Funnel_Type } from "../funnels.js";
import { STEP_OF_ANALYSIS } from "../step.js";
import saveFunnelComments from "../supabase/saveFunnelComments.js";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus.js";
import getAllTweets from "./getAllTweets.js";
import getTwitterComments from "./getTwitterComments.js";

const analyzeComments = async (
  scraper: any,
  chat_id: string | null,
  analysisId: string,
  handle: string,
) => {
  await updateAnalysisStatus(
    chat_id,
    analysisId,
    Funnel_Type.TWITTER,
    STEP_OF_ANALYSIS.POST_COMMENTS,
  );
  const allTweets = await getAllTweets(scraper, handle);
  const comments = getTwitterComments(allTweets, analysisId);
  await saveFunnelComments(comments);

  return comments;
};

export default analyzeComments;
