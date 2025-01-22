import { Scraper } from "agent-twitter-client";
import { STEP_OF_ANALYSIS } from "../lib/step";
import beginAnalysis from "../lib/supabase/beginAnalysis";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus";
import { Funnel_Type } from "../lib/funnels";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat";
import createWrappedAnalysis from "./createWrappedAnalysis";
import createArtist from "../lib/createArtist";
import analyzeComments from "../lib/twitter/analyzeComments";
import analyzeSegments from "../lib/analyzeSegments";
import getSocialProfile from "../lib/twitter/getSocialProfile";

const scraper = new Scraper();

const getTwitterAnalysis = async (
  handle: string,
  chat_id: string,
  account_id: string | null,
  address: string | null,
  isWrapped: boolean,
  existingArtistId: string | null = null,
) => {
  const newAnalysis = await beginAnalysis(chat_id, handle, Funnel_Type.TWITTER);
  const analysisId = newAnalysis.id;
  try {
    const scrappedProfile = await getSocialProfile(
      scraper,
      chat_id,
      analysisId,
      handle,
      existingArtistId,
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
      analysisId,
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
