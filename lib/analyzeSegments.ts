import getSegments from "./getSegments.js";
import getSegmentsWithIcons from "./getSegmentsWithIcons.js";
import { STEP_OF_ANALYSIS } from "./step.js";
import saveFunnelSegments from "./supabase/saveFunnelSegments.js";
import updateAnalysisStatus from "./supabase/updateAgentStatus.js";

const analyzeSegments = async (
  pilot_id: string | null,
  analysisId: string,
  videoComments: any,
  funnel_type: string,
) => {
  await updateAnalysisStatus(
    pilot_id,
    analysisId,
    funnel_type,
    STEP_OF_ANALYSIS.SEGMENTS,
  );
  const segments = await getSegments(videoComments);
  const segmentsWithIcons = await getSegmentsWithIcons(segments, analysisId);
  await saveFunnelSegments(segmentsWithIcons);
  await updateAnalysisStatus(
    pilot_id,
    analysisId,
    funnel_type,
    STEP_OF_ANALYSIS.SAVING_ANALYSIS,
  );
  return segmentsWithIcons;
};

export default analyzeSegments;
