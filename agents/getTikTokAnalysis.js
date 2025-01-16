import { Funnel_Type } from "../lib/funnels.js";
import getSocialHandles from "../lib/getSocialHandles.js";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat.js";
import { STEP_OF_ANALYSIS } from "../lib/step.js";
import beginAnalysis from "../lib/supabase/beginAnalysis.js";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus.js";
import analyzeProfile from "../lib/tiktok/analyzeProfile.js";
import analyzeSegments from "../lib/analyzeSegments.js";
import analyzeVideoComments from "../lib/tiktok/analyzeVideoComments.js";
import createArtist from "../lib/createArtist.js";
import createWrappedAnalysis from "./createWrappedAnalysis.js";
import getSocialProfile from "../lib/tiktok/getSocialProfile.js";

const getTikTokAnalysis = async (
  handle,
  chat_id,
  account_id,
  address,
  isWrapped,
  existingArtistId,
) => {
  const newAnalysis = await beginAnalysis(chat_id, handle, Funnel_Type.TIKTOK);
  const analysisId = newAnalysis.id;
  try {
    const { scrapedVideoUrls, scrapedProfile, analyzedProfileError } =
      await getSocialProfile(chat_id, analysisId, existingArtistId);
    if (!scrapedProfile || analyzedProfileError) {
      await updateAnalysisStatus(
        chat_id,
        analysisId,
        Funnel_Type.INSTAGRAM,
        analyzedProfileError?.status,
      );
      return;
    }
    const newArtist = await createArtist(
      chat_id,
      analysisId,
      account_id,
      existingArtistId,
      scrapedProfile,
      "tiktok",
      `https://tiktok.com/@${scrapedProfile?.name}`,
    );

    const videoComments = await analyzeVideoComments(
      scrapedVideoUrls,
      chat_id,
      analysisId,
    );
    await analyzeSegments(
      chat_id,
      analysisId,
      videoComments,
      Funnel_Type.TIKTOK,
    );
    await trackFunnelAnalysisChat(
      address,
      handle,
      newArtist?.id,
      chat_id,
      isWrapped ? "Wrapped" : "TikTok",
    );
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.TIKTOK,
      STEP_OF_ANALYSIS.FINISHED,
    );
    if (isWrapped)
      await createWrappedAnalysis(
        handle,
        chat_id,
        account_id,
        address,
        existingArtistId,
      );
    return;
  } catch (error) {
    console.error(error);
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.TIKTOK,
      STEP_OF_ANALYSIS.ERROR,
    );
  }
};

export default getTikTokAnalysis;
