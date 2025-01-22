import { Funnel_Type } from "../lib/funnels";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat";
import { STEP_OF_ANALYSIS } from "../lib/step";
import beginAnalysis from "../lib/supabase/beginAnalysis";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus";
import analyzeSegments from "../lib/analyzeSegments";
import analyzeVideoComments from "../lib/tiktok/analyzeVideoComments";
import createArtist from "../lib/createArtist";
import createWrappedAnalysis from "./createWrappedAnalysis";
import getSocialProfile from "../lib/tiktok/getSocialProfile";

const getTikTokAnalysis = async (
  handle: string,
  chat_id: string,
  account_id: string | null,
  address: string | null,
  isWrapped: boolean,
  existingArtistId: string | null = null,
) => {
  const newAnalysis = await beginAnalysis(chat_id, handle, Funnel_Type.TIKTOK);
  const analysisId = newAnalysis.id;
  try {
    const { scrapedVideoUrls, scrapedProfile, analyzedProfileError } =
      await getSocialProfile(chat_id, analysisId, handle, existingArtistId);
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
