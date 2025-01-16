import { Funnel_Type } from "../lib/funnels.js";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat.js";
import { STEP_OF_ANALYSIS } from "../lib/step.js";
import beginAnalysis from "../lib/supabase/beginAnalysis.js";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus.js";
import createWrappedAnalysis from "./createWrappedAnalysis.js";
import analyzeProfile from "../lib/instagram/analyzeProfile.js";
import getSocialHandles from "../lib/getSocialHandles.js";
import createArtist from "../lib/createArtist.js";
import analyzeComments from "../lib/instagram/analyzeComments.js";
import analyzeSegments from "../lib/analyzeSegments.js";

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
    let scrapedProfile, scrapedPostUrls, analyzedProfileError;
    const { profile, latestPosts, error } = await analyzeProfile(
      chat_id,
      analysisId,
      handle,
    );
    scrapedProfile = profile;
    scrapedPostUrls = latestPosts;
    analyzedProfileError = error;
    console.log("ZIAD scrapedProfile", scrapedProfile, scrapedPostUrls, error);
    if (!scrapedProfile || analyzedProfileError) {
      const handles = await getSocialHandles(handle);
      console.log("ZIAD", handles.instagram);
      const { profile, latestPosts, error } = await analyzeProfile(
        handles.instagram,
      );
      analyzedProfileError = error;
      scrapedProfile = profile;
      scrapedPostUrls = latestPosts;
      console.log(
        "ZIAD scrapedProfile",
        scrapedProfile,
        scrapedPostUrls,
        analyzedProfileError,
      );
    }
    if (!scrapedProfile || analyzedProfileError) {
      console.log("ZIAD analyzedProfileError", analyzedProfileError);
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
      latestPosts,
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
