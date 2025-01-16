import { Funnel_Type } from "../funnels.js";
import getSegments from "../getSegments.js";
import getSegmentsWithIcons from "../getSegmentsWithIcons.js";
import { STEP_OF_ANALYSIS } from "../step";
import saveFunnelSegments from "../supabase/saveFunnelSegments.js";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus.js";

const analyzeSegments = async (chat_id, analysisId, videoComments) => {
  await updateAnalysisStatus(
    chat_id,
    analysisId,
    Funnel_Type.TIKTOK,
    STEP_OF_ANALYSIS.SEGMENTS,
  );
  const segments = await getSegments(videoComments);
  const segmentsWithIcons = await getSegmentsWithIcons(segments, analysisId);
  await saveFunnelSegments(segmentsWithIcons);
  await updateAnalysisStatus(
    chat_id,
    analysisId,
    Funnel_Type.TIKTOK,
    STEP_OF_ANALYSIS.SAVING_ANALYSIS,
  );
};

export default analyzeSegments;
