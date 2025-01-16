import { Funnel_Type } from "../funnels.js";
import { STEP_OF_ANALYSIS } from "../step.js";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus.js";
import getProfile from "./getProfile.js";
import getProfileDatasetId from "./getProfileDatasetId.js";

const analyzeProfile = async (chat_id, analysisId, handle) => {
  await updateAnalysisStatus(
    chat_id,
    analysisId,
    Funnel_Type.INSTAGRAM,
    STEP_OF_ANALYSIS.PROFILE,
  );
  const profileDatasetId = await getProfileDatasetId(handle);
  console.log("ZIAD profileDatasetId", profileDatasetId);
  const accountData = await getProfile(profileDatasetId);
  const profile = accountData?.profile;
  const latestPosts = accountData?.latestPosts;

  return {
    profile,
    latestPosts,
  };
};

export default analyzeProfile;
