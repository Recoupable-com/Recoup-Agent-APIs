import { Funnel_Type } from "../funnels";
import { STEP_OF_ANALYSIS } from "../step";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus";
import getProfile from "./getProfile";
import getProfileDatasetId from "./getProfileDatasetId";

const analyzeProfile = async (
  chat_id: string | null,
  analysisId: string,
  handle: string,
) => {
  await updateAnalysisStatus(
    chat_id,
    analysisId,
    Funnel_Type.INSTAGRAM,
    STEP_OF_ANALYSIS.PROFILE,
  );
  const profileDatasetId = await getProfileDatasetId(handle);
  const accountData: any = await getProfile(profileDatasetId, chat_id);
  if (accountData?.error) {
    return { error: accountData?.error, profile: null, latestPosts: null };
  }
  const profile = accountData?.profile;
  const latestPosts = accountData?.latestPosts;

  return {
    profile,
    latestPosts,
    error: false,
  };
};

export default analyzeProfile;
