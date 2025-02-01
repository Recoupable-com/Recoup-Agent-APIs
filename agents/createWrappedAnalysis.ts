import getSegments from "../lib/getSegments";
import getSegmentsWithIcons from "../lib/getSegmentsWithIcons";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat";
import beginAnalysis from "../lib/supabase/beginAnalysis";
import saveFunnelProfile from "../lib/supabase/saveFunnelProfile";
import saveFunnelSegments from "../lib/supabase/saveFunnelSegments";
import getAnalyses from "../lib/supabase/getAnalyses";
import getAggregatedArtist from "../lib/agent/getAggregatedArtist";
import getArtist from "../lib/supabase/getArtist";
import getAggregatedProfile from "../lib/agent/getAggregatedProfile";
import updateArtistProfile from "../lib/supabase/updateArtistProfile";
import createSocialLink from "../lib/supabase/createSocialLink";
import getComments from "../lib/agent/getComments";
import getAggregatedSocialProfile from "../lib/agent/getAggregatedSocialProfile";
import checkWrappedCompleted from "../lib/agent/checkWrappedCompleted";
import { STEP_OF_ANALYSIS } from "../lib/step";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus";
import { Funnel_Type, SOCIAL } from "../lib/funnels";

const createWrappedAnalysis = async (
  handle: string,
  pilot_id: string,
  account_id: string | null,
  address: string | null,
  existingArtistId: string | null
) => {
  const funnel_analyses = await getAnalyses(pilot_id);
  const wrappedCompleted = checkWrappedCompleted(funnel_analyses);
  if (!wrappedCompleted) return;
  const newAnalysis = await beginAnalysis(pilot_id, handle);
  if (!newAnalysis?.agentStatus?.id) {
    console.error("Failed to create analysis");
    return;
  }
  const analysisId = newAnalysis.agentStatus.id;
  try {
    const artist = getAggregatedArtist(funnel_analyses);
    const existingArtist = await getArtist(existingArtistId);
    const aggregatedArtistProfile = getAggregatedProfile(
      artist,
      existingArtist
    );

    const artistId = await updateArtistProfile(
      account_id,
      aggregatedArtistProfile.image,
      aggregatedArtistProfile.name,
      existingArtistId
    );

    aggregatedArtistProfile.account_socials.forEach(async (link: SOCIAL) => {
      await createSocialLink(artistId, link.type, link.link);
    });

    const aggregatedSocialProfile = getAggregatedSocialProfile(
      funnel_analyses,
      existingArtist
    );
    await saveFunnelProfile({
      ...aggregatedSocialProfile,
      analysis_id: analysisId,
      artistId: artistId,
    });

    const comments = getComments(funnel_analyses);
    const segments = await getSegments(comments.slice(0, 500));
    const segmentsWithIcons = await getSegmentsWithIcons(segments, analysisId);
    await saveFunnelSegments(segmentsWithIcons);

    if (address) {
      await trackFunnelAnalysisChat(
        address,
        handle,
        artistId,
        pilot_id,
        "Wrapped"
      );
    }
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.WRAPPED,
      STEP_OF_ANALYSIS.WRAPPED_COMPLETED
    );
    return;
  } catch (error) {
    console.error(error);
  }
};

export default createWrappedAnalysis;
