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
  try {
    // Get Instagram profile first
    const { scrapedProfile, scrapedPostUrls, analyzedProfileError } =
      await getSocialProfile(pilot_id, "", handle, existingArtistId);

    if (!scrapedProfile || analyzedProfileError) {
      console.error("Failed to get Instagram profile:", analyzedProfileError);
      return;
    }

    // Create or get social record
    const { social, error: socialError } = await createOrGetSocial(
      scrapedProfile.username,
      `https://instagram.com/${scrapedProfile.username}`,
      scrapedProfile.avatar,
      scrapedProfile.bio,
      scrapedProfile.followerCount,
      scrapedProfile.followingCount,
      null // region is not available from Instagram
    );

    console.log("social", social);

    if (socialError || !social) {
      console.error("Failed to create/get social record:", socialError);
      return;
    }

    // Now create the analysis with the social ID
    const { agentStatus, error: analysisError } = await beginAnalysis(
      pilot_id,
      social.id
    );

    if (analysisError || !agentStatus) {
      console.error("Failed to create analysis:", analysisError);
      return;
    }

    const analysisId = agentStatus.id;

    // Create enriched profile with social ID
    const enrichedProfile = {
      ...scrapedProfile,
      id: social.id,
    };

    const postComments = await analyzeComments(
      pilot_id,
      analysisId,
      scrapedPostUrls
    );

    await analyzeSegments(
      pilot_id,
      analysisId,
      postComments,
      Funnel_Type.INSTAGRAM
    );

    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.FINISHED
    );

    if (isWrapped) {
      await createWrappedAnalysis(
        handle,
        pilot_id,
        account_id,
        address,
        existingArtistId
      );
    }
    return;
  } catch (error) {
    console.error("Error in getInstagramAnalysis:", error);
  }
};

export default getInstagramAnalysis;
