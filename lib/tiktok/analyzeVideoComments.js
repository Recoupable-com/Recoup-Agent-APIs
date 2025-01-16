import saveFunnelComments from "../supabase/saveFunnelComments.js";
import getVideoComments from "./getVideoComments.js";

const analyzeVideoComments = async (videoUrls, chat_id, analysisId) => {
  const videoComments = await getVideoComments(videoUrls, chat_id, analysisId);
  await saveFunnelComments(videoComments);

  return videoComments;
};

export default analyzeVideoComments;
