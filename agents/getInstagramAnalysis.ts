import { Funnel_Type } from "../lib/funnels";
import { STEP_OF_ANALYSIS } from "../lib/step";
import beginAnalysis from "../lib/supabase/beginAnalysis";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus";
import createWrappedAnalysis from "./createWrappedAnalysis";
import analyzeComments from "../lib/instagram/analyzeComments";
import analyzeSegments from "../lib/analyzeSegments";
import getSocialProfile from "../lib/instagram/getSocialProfile";
import { createOrGetSocial } from "../lib/supabase/createOrGetSocial";

const getInstagramAnalysis = async (
  handle: string,
  pilot_id: string,
  account_id: string | null,
  address: string | null,
  isWrapped: boolean,
  existingArtistId: string | null = null
) => {
  console.log(
    "🚀 [getInstagramAnalysis] Starting analysis for handle:",
    handle
  );
  console.log("📝 Parameters:", {
    pilot_id,
    account_id,
    address,
    isWrapped,
    existingArtistId,
  });

  let analysisId;
  try {
    // Get Instagram profile first
    console.log("📝 [getInstagramAnalysis] Getting Instagram profile...");
    await updateAnalysisStatus(
      pilot_id,
      "",
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.INITIAL,
      0
    );

    const { scrapedProfile, scrapedPostUrls, analyzedProfileError } =
      await getSocialProfile(pilot_id, "", handle, existingArtistId);

    if (!scrapedProfile || analyzedProfileError) {
      console.error(
        "❌ [getInstagramAnalysis] Failed to get Instagram profile:",
        analyzedProfileError
      );
      await updateAnalysisStatus(
        pilot_id,
        "",
        Funnel_Type.INSTAGRAM,
        STEP_OF_ANALYSIS.ERROR,
        0
      );
      return;
    }
    console.log(
      "✅ [getInstagramAnalysis] Got Instagram profile:",
      scrapedProfile
    );
    console.log("📝 [getInstagramAnalysis] Post URLs:", scrapedPostUrls);

    // Create or get social record
    console.log("📝 [getInstagramAnalysis] Creating/getting social record...");
    const { social, error: socialError } = await createOrGetSocial(
      scrapedProfile.username,
      `https://instagram.com/${scrapedProfile.username}`,
      scrapedProfile.avatar,
      scrapedProfile.bio,
      scrapedProfile.followerCount,
      scrapedProfile.followingCount,
      null // region is not available from Instagram
    );

    console.log("📝 [getInstagramAnalysis] Social record result:", social);

    if (socialError || !social) {
      console.error(
        "❌ [getInstagramAnalysis] Failed to create/get social record:",
        socialError
      );
      await updateAnalysisStatus(
        pilot_id,
        "",
        Funnel_Type.INSTAGRAM,
        STEP_OF_ANALYSIS.ERROR,
        0
      );
      return;
    }

    // Now create the analysis with the social ID
    console.log("📝 [getInstagramAnalysis] Beginning analysis...");
    const { agentStatus, error: analysisError } = await beginAnalysis(
      pilot_id,
      social.id
    );

    if (analysisError || !agentStatus) {
      console.error(
        "❌ [getInstagramAnalysis] Failed to create analysis:",
        analysisError
      );
      await updateAnalysisStatus(
        pilot_id,
        "",
        Funnel_Type.INSTAGRAM,
        STEP_OF_ANALYSIS.ERROR,
        0
      );
      return;
    }

    analysisId = agentStatus.id;
    console.log(
      "✅ [getInstagramAnalysis] Analysis created with ID:",
      analysisId
    );

    // Update status to PROFILE after successful profile retrieval
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.PROFILE,
      20
    );

    console.log("📝 [getInstagramAnalysis] Analyzing comments...");
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.POST_COMMENTS,
      40
    );

    const postComments = await analyzeComments(
      pilot_id,
      analysisId,
      scrapedPostUrls
    );
    console.log("✅ [getInstagramAnalysis] Comments analyzed");

    console.log("📝 [getInstagramAnalysis] Analyzing segments...");
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.SEGMENTS,
      60
    );

    await analyzeSegments(
      pilot_id,
      analysisId,
      postComments,
      Funnel_Type.INSTAGRAM
    );
    console.log("✅ [getInstagramAnalysis] Segments analyzed");

    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.SAVING_ANALYSIS,
      80
    );

    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.FINISHED,
      100
    );
    console.log(
      "✅ [getInstagramAnalysis] Analysis status updated to FINISHED"
    );

    if (isWrapped) {
      console.log("📝 [getInstagramAnalysis] Starting wrapped analysis...");
      await createWrappedAnalysis(
        handle,
        pilot_id,
        account_id,
        address,
        existingArtistId
      );
      console.log("✅ [getInstagramAnalysis] Wrapped analysis completed");
    }
    console.log("✅ [getInstagramAnalysis] Analysis completed successfully");
    return;
  } catch (error) {
    console.error("❌ [getInstagramAnalysis] Error:", error);

    await updateAnalysisStatus(
      pilot_id,
      analysisId || "",
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.ERROR,
      0
    );
    console.log("⚠️ [getInstagramAnalysis] Analysis status updated to ERROR");
  }
};

export default getInstagramAnalysis;
