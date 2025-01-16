import { Funnel_Type } from "../funnels.js";
import { STEP_OF_ANALYSIS } from "../step.js";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus.js";
import getFormattedProfile from "./getFormattedProfile.js";

const getSocialProfile = async (scraper, chat_id, analysisId, handle) => {
  await updateAnalysisStatus(
    chat_id,
    analysisId,
    Funnel_Type.TWITTER,
    STEP_OF_ANALYSIS.PROFILE,
  );
  const scrappedProfile = await scraper.getProfile(handle);

  console.log("ZIAD PROFILE", scrappedProfile);

  return getFormattedProfile(scrappedProfile);
};

export default getSocialProfile;
