import { Scraper } from "agent-twitter-client";
import { STEP_OF_ANALYSIS } from "../lib/step.js";
import beginAnalysis from "../lib/supabase/beginAnalysis.js";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus.js";
import { Funnel_Type } from "../lib/funnels.js";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat.js";
import createWrappedAnalysis from "./createWrappedAnalysis.js";
import createArtist from "../lib/createArtist.js";
import analyzeComments from "../lib/twitter/analyzeComments.js";
import analyzeSegments from "../lib/analyzeSegments.js";
import getSocialProfile from "../lib/twitter/getSocialProfile.js";

const scraper = new Scraper();

const getTwitterAnalysis = async (
  handle,
  chat_id,
  account_id,
  address,
  isWrapped,
  existingArtistId,
) => {
  const newAnalysis = await beginAnalysis(chat_id, handle, Funnel_Type.TWITTER);
  const analysisId = newAnalysis.id;
  try {
    const scrappedProfile = await getSocialProfile(
      scraper,
      chat_id,
      analysisId,
      handle,
    );
    const newArtist = await createArtist(
      chat_id,
      analysisId,
      account_id,
      existingArtistId,
      scrappedProfile,
      "twitter",
      `https://x.com/${scrappedProfile?.name}`,
    );
    const comments = await analyzeComments(
      scraper,
      chat_id,
      account_id,
      handle,
    );
    await analyzeSegments(chat_id, analysisId, comments, Funnel_Type.TWITTER);

    await trackFunnelAnalysisChat(
      address,
      handle,
      newArtist?.id,
      chat_id,
      isWrapped ? "Wrapped" : "Twitter",
    );
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.TWITTER,
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
      Funnel_Type.TWITTER,
      STEP_OF_ANALYSIS.ERROR,
    );
  }
};

export default getTwitterAnalysis;
