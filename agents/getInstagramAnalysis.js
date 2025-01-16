import { Funnel_Type } from "../lib/funnels.js";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat.js";
import { STEP_OF_ANALYSIS } from "../lib/step.js";
import beginAnalysis from "../lib/supabase/beginAnalysis.js";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus.js";
import createWrappedAnalysis from "./createWrappedAnalysis.js";
import createArtist from "../lib/createArtist.js";
import analyzeComments from "../lib/instagram/analyzeComments.js";
import analyzeSegments from "../lib/analyzeSegments.js";
import getSocialProfile from "../lib/instagram/getSocialProfile.js";

const getInstagramAnalysis = async (
  handle,
  chat_id,
  account_id,
  address,
  isWrapped,
  existingArtistId,
) => {
  const newAnalysis = await beginAnalysis(
    chat_id,
    handle,
    Funnel_Type.INSTAGRAM,
  );
  const analysisId = newAnalysis.id;
  try {
    const { scrapedPostUrls, scrapedProfile, analyzedProfileError } =
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
      "instagram",
      `https://instagram.com/${scrapedProfile?.name}`,
    );
    const postComments = await analyzeComments(
      chat_id,
      analysisId,
      scrapedPostUrls,
    );
    await analyzeSegments(
      chat_id,
      analysisId,
      postComments,
      Funnel_Type.INSTAGRAM,
    );
    if (address) {
      await trackFunnelAnalysisChat(
        address,
        handle,
        newArtist?.id,
        chat_id,
        isWrapped ? "Wrapped" : "Instagram",
      );
    }
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
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
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.ERROR,
    );
    throw new Error(error);
  }
};

export default getInstagramAnalysis;
