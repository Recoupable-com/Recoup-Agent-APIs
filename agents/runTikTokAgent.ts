import { Funnel_Type } from "../lib/funnels";
import updateAnalysisStatus from "../lib/supabase/updateAgentStatus";
import analyzeSegments from "../lib/analyzeSegments";
import analyzeVideoComments from "../lib/tiktok/analyzeVideoComments";
import getSocialProfile from "../lib/tiktok/getSocialProfile";
import getFanSegments from "../lib/getFanSegments";
import getSocialProfiles from "../lib/tiktok/getSocialProfiles";
import updateAgentStatus from "../lib/supabase/updateAgentStatus";
import updateArtist from "../lib/updateArtist";

const runTikTokAgent = async (
  agent_id: string,
  handle: string,
  artistId: string,
) => {
  try {
    const { scrapedVideoUrls, scrapedProfile, analyzedProfileError } =
      await getSocialProfile(agent_id, handle);
    if (!scrapedProfile || analyzedProfileError) {
      await updateAgentStatus(
        agent_id,
        Funnel_Type.TIKTOK,
        analyzedProfileError?.status
      );
      return;
    }
    const newArtist = await updateArtist(
      artistId,
      scrapedProfile
    );

    const videoComments = await analyzeVideoComments(
      scrapedVideoUrls,
      pilot_id,
      analysisId,
    );
  
    const segments = await analyzeSegments(
      pilot_id,
      analysisId,
      videoComments,
      Funnel_Type.TIKTOK,
    );
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.TIKTOK,
      STEP_OF_ANALYSIS.FINISHED,
    );
    const fansSegments = await getFanSegments(segments, videoComments);
    await getSocialProfiles(fansSegments, newArtist.account_id);
    return;
  } catch (error) {
    console.error(error);
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.TIKTOK,
      STEP_OF_ANALYSIS.ERROR,
    );
  }
};

export default runTikTokAgent;
