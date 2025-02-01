import { Funnel_Type } from "../lib/funnels";
import { STEP_OF_ANALYSIS } from "../lib/step";
import beginAnalysis from "../lib/supabase/initialize";
import updateAnalysisStatus from "../lib/supabase/updateAgentStatus";
import createArtist from "../lib/updateArtist";
import analyzeComments from "../lib/instagram/analyzeComments";
import analyzeSegments from "../lib/analyzeSegments";
import getSocialProfile from "../lib/instagram/getSocialProfile";

const runInstagramAgent = async (
  handle: string,
  pilot_id: string,
  account_id: string | null,
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
      `https://instagram.com/${scrapedProfile?.username}`,
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
   
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.FINISHED,
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
  }
};

export default runInstagramAgent;
