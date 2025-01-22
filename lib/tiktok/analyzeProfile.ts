import { Funnel_Type } from "../funnels.js";
import { STEP_OF_ANALYSIS } from "../step.js";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus.js";
import getProfile from "./getProfile.js";
import getProfileDatasetId from "./getProfileDatasetId.js";

const analyzeProfile = async (
  chat_id: string | null,
  analysisId: string,
  handle: string,
) => {
  await updateAnalysisStatus(
    chat_id,
    analysisId,
    Funnel_Type.TIKTOK,
    STEP_OF_ANALYSIS.PROFILE,
  );
  const profileDatasetId = await getProfileDatasetId(handle);
  const accountData: any = await getProfile(profileDatasetId);
  if (accountData?.error) {
    return { error: accountData?.error, profile: null, videoUrls: null };
  }
  const profile = accountData?.profile?.[0];
  const videoUrls = accountData?.videoUrls;

  return {
    profile,
    videoUrls,
    error: false,
  };
};

export default analyzeProfile;
