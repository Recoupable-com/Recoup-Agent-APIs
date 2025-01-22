import saveFunnelComments from "../supabase/saveFunnelComments.js";
import getVideoComments from "./getVideoComments.js";

const analyzeVideoComments = async (
  videoUrls: any,
  chat_id: string | null,
  analysisId: string,
) => {
  const videoComments = await getVideoComments(videoUrls, chat_id, analysisId);
  await saveFunnelComments(videoComments);

  return videoComments;
};

export default analyzeVideoComments;
