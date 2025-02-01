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
import { createOrGetSocial } from "../lib/supabase/createOrGetSocial";
import type { Database } from "../types/database.types";

const scraper = new Scraper();

const getTwitterAnalysis = async (
  handle: string,
  pilot_id: string,
  account_id: string | null,
  address: string | null,
  isWrapped: boolean,
  existingArtistId: string | null = null
) => {
  console.log("getTwitterAnalysis");
  let analysisId;
  try {
    // Get Twitter profile first
    const scrappedProfile = await getSocialProfile(
      scraper,
      pilot_id,
      "", // Empty string instead of null for analysisId
      handle,
      existingArtistId
    );

    // Create or get social record
    const { social, error: socialError } = await createOrGetSocial(
      scrappedProfile.username,
      `https://twitter.com/${scrappedProfile.username}`,
      scrappedProfile.avatar,
      scrappedProfile.bio,
      scrappedProfile.followerCount,
      scrappedProfile.followingCount,
      null // region is not available from Twitter
    );

    console.log("social", social);

    if (socialError || !social) {
      console.error("Failed to create/get social record:", socialError);
      throw socialError;
    }

    // Now create the analysis with the social ID
    const { agentStatus, error: analysisError } = await beginAnalysis(
      pilot_id,
      social.id
    );

    if (analysisError || !agentStatus) {
      console.error("Failed to create analysis:", analysisError);
      throw analysisError;
    }

    console.log("agentStatus", agentStatus);
    analysisId = agentStatus.id;

    const comments = await analyzeComments(
      scraper,
      pilot_id,
      analysisId,
      handle
    );

    const segments = await analyzeSegments(
      pilot_id,
      analysisId,
      comments,
      Funnel_Type.TWITTER
    );

    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.TWITTER,
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

    const fansSegments = await getFanSegments(segments, comments);
    await getSocialProfiles(scraper, fansSegments, account_id);
    return;
  } catch (error) {
    console.error(error);
    await updateAnalysisStatus(
      // We can't update the analysis status if we don't have an analysisId
      pilot_id, // This is expected if the error occurred before analysis creation
      analysisId,
      Funnel_Type.TWITTER,
      STEP_OF_ANALYSIS.ERROR
    );
  }
};

export default getTwitterAnalysis;
