import { Funnel_Type } from "../funnels.js";
import { STEP_OF_ANALYSIS } from "../step.js";
import saveFunnelComments from "../supabase/saveFunnelComments.js";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus.js";
import getAllTweets from "./getAllTweets.js";
import getTwitterComments from "./getTwitterComments.js";

const analyzeComments = async (scraper, chat_id, analysisId, handle) => {
  await updateAnalysisStatus(
    chat_id,
    analysisId,
    Funnel_Type.TWITTER,
    STEP_OF_ANALYSIS.POST_COMMENTS,
  );
  const allTweets = await getAllTweets(scraper, handle);
  console.log("ZIAD", allTweets);
  const comments = getTwitterComments(allTweets, analysisId);
  await saveFunnelComments(comments);

  return comments;
};

export default analyzeComments;
