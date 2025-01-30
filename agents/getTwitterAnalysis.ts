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
import getFanSegments from "../lib/getFanSegments";
import getSocialProfiles from "../lib/twitter/getSocialProfiles";

const scraper = new Scraper();

const getTwitterAnalysis = async (
  handle: string,
  pilot_id: string,
  account_id: string | null,
  address: string | null,
  isWrapped: boolean,
  existingArtistId: string | null = null,
) => {
  const newAnalysis = await beginAnalysis(
    pilot_id,
    handle,
    Funnel_Type.TWITTER,
    existingArtistId,
  );
  const analysisId = newAnalysis.id;
  try {
    const scrappedProfile = await getSocialProfile(
      scraper,
      pilot_id,
      analysisId,
      handle,
      existingArtistId,
    );
    const newArtist = await createArtist(
      pilot_id,
      analysisId,
      account_id,
      existingArtistId,
      scrappedProfile,
      "twitter",
      `https://x.com/${scrappedProfile?.username}`,
    );
    const comments = await analyzeComments(
      scraper,
      pilot_id,
      analysisId,
      handle,
    );

    const segments = await analyzeSegments(
      pilot_id,
      analysisId,
      comments,
      Funnel_Type.TWITTER,
    );

    await trackFunnelAnalysisChat(
      address,
      handle,
      newArtist?.account_id,
      pilot_id,
      isWrapped ? "Wrapped" : "Twitter",
    );
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.TWITTER,
      STEP_OF_ANALYSIS.FINISHED,
    );
    if (isWrapped)
      await createWrappedAnalysis(
        handle,
        pilot_id,
        account_id,
        address,
        existingArtistId,
      );
    const fansSegments = await getFanSegments(segments, comments);
    await getSocialProfiles(scraper, fansSegments, newArtist.account_id);
    return;
  } catch (error) {
    console.error(error);
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.TWITTER,
      STEP_OF_ANALYSIS.ERROR,
    );
  }
};

export default getTwitterAnalysis;
