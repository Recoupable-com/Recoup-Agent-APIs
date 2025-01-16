import { Funnel_Type } from "../lib/funnels.js";
import getSocialHandles from "../lib/getSocialHandles.js";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat.js";
import { STEP_OF_ANALYSIS } from "../lib/step.js";
import beginAnalysis from "../lib/supabase/beginAnalysis.js";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus.js";
import analyzeProfile from "../lib/tiktok/analyzeProfile.js";
import analyzeSegments from "../lib/tiktok/analyzeSegments.js";
import analyzeVideoComments from "../lib/tiktok/analyzeVideoComments.js";
import createArtist from "../lib/tiktok/createArtist.js";
import createWrappedAnalysis from "./createWrappedAnalysis.js";

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
    let scrapedProfile, scrapedVideoUrls;
    const { profile, videoUrls } = await analyzeProfile(
      chat_id,
      analysisId,
      handle,
    );
    scrapedProfile = profile;
    scrapedVideoUrls = videoUrls;
    if (!scrapedProfile) {
      const handles = await getSocialHandles(handle);
      const { profile, videoUrls } = await analyzeProfile(handles.tiktok);
      scrapedProfile = profile;
      scrapedVideoUrls = videoUrls;
    }
    const newArtist = await createArtist(
      chat_id,
      analysisId,
      account_id,
      existingArtistId,
      profile,
    );
    const videoComments = await analyzeVideoComments(
      videoUrls,
      chat_id,
      analysisId,
    );
    await analyzeSegments(chat_id, analysisId, videoComments);
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
