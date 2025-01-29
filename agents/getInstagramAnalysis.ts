import { Funnel_Type } from "../lib/funnels";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat";
import { STEP_OF_ANALYSIS } from "../lib/step";
import beginAnalysis from "../lib/supabase/beginAnalysis";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus";
import createWrappedAnalysis from "./createWrappedAnalysis";
import createArtist from "../lib/createArtist";
import analyzeComments from "../lib/instagram/analyzeComments";
import analyzeSegments from "../lib/analyzeSegments";
import getSocialProfile from "../lib/instagram/getSocialProfile";

const getInstagramAnalysis = async (
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
    Funnel_Type.INSTAGRAM,
    existingArtistId,
  );
  const analysisId = newAnalysis.id;
  try {
    const { scrapedPostUrls, scrapedProfile, analyzedProfileError } =
      await getSocialProfile(pilot_id, analysisId, handle, existingArtistId);
    if (!scrapedProfile || analyzedProfileError) {
      await updateAnalysisStatus(
        pilot_id,
        analysisId,
        Funnel_Type.INSTAGRAM,
        analyzedProfileError?.status,
      );
      return;
    }
    const newArtist = await createArtist(
      pilot_id,
      analysisId,
      account_id,
      existingArtistId,
      scrapedProfile,
      "instagram",
      `https://instagram.com/${scrapedProfile?.name}`,
    );

    const postComments = await analyzeComments(
      pilot_id,
      analysisId,
      scrapedPostUrls,
    );
    await analyzeSegments(
      pilot_id,
      analysisId,
      postComments,
      Funnel_Type.INSTAGRAM,
    );
    if (address) {
      await trackFunnelAnalysisChat(
        address,
        handle,
        newArtist?.account_id,
        pilot_id,
        isWrapped ? "Wrapped" : "Instagram",
      );
    }
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
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
    return;
  } catch (error) {
    console.error(error);
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.ERROR,
    );
    throw new Error(error as string);
  }
};

export default getInstagramAnalysis;
