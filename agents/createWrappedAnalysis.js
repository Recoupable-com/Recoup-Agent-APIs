import getSegments from "../lib/getSegments.js";
import getSegmentsWithIcons from "../lib/getSegmentsWithIcons.js";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat.js";
import beginAnalysis from "../lib/supabase/beginAnalysis.js";
import saveFunnelProfile from "../lib/supabase/saveFunnelProfile.js";
import saveFunnelSegments from "../lib/supabase/saveFunnelSegments.js";
import getAnalyses from "../lib/supabase/getAnalyses.js";
import getAggregatedArtist from "../lib/agent/getAggregatedArtist.js";
import getArtist from "../lib/supabase/getArtist.js";
import getAggregatedProfile from "../lib/agent/getAggregatedProfile.js";
import updateArtistProfile from "../lib/supabase/updateArtistProfile.js";
import createSocialLink from "../lib/supabase/createSocialLink.js";
import getComments from "../lib/agent/getComments.js";
import getAggregatedSocialProfile from "../lib/agent/getAggregatedSocialProfile.js";
import checkWrappedCompleted from "../lib/agent/checkWrappedCompleted.js";
import { STEP_OF_ANALYSIS } from "../lib/step.js";

const createWrappedAnalysis = async (
  handle,
  chat_id,
  account_id,
  address,
  existingArtistId,
) => {
  const funnel_analyses = await getAnalyses(chat_id);
  const wrappedCompleted = checkWrappedCompleted(funnel_analyses);
  if (!wrappedCompleted) return;
  const newAnalysis = await beginAnalysis(chat_id, handle);
  const analysisId = newAnalysis.id;
  try {
    const artist = getAggregatedArtist(funnel_analyses);
    const existingArtist = await getArtist(existingArtistId);
    const aggregatedArtistProfile = getAggregatedProfile(
      artist,
      existingArtist,
    );

    const artistId = await updateArtistProfile(
      account_id,
      aggregatedArtistProfile.image,
      aggregatedArtistProfile.name,
      aggregatedArtistProfile.instruction,
      aggregatedArtistProfile.label,
      aggregatedArtistProfile.knowledges,
      existingArtistId,
    );

    aggregatedArtistProfile.artist_social_links.forEach(async (link) => {
      await createSocialLink(artistId, link.type, link.link);
    });

    const aggregatedSocialProfile = getAggregatedSocialProfile(funnel_analyses);
    await saveFunnelProfile({
      ...aggregatedSocialProfile,
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
        chat_id,
        "Wrapped",
      );
    }
    global.io.emit(`${chat_id}`, {
      status: STEP_OF_ANALYSIS.WRAPPED_COMPLETED,
    });
    return;
  } catch (error) {
    console.log(error);
  }
};

export default createWrappedAnalysis;
