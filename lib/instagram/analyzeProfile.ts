import { Funnel_Type } from "../funnels";
import { STEP_OF_ANALYSIS } from "../step";
import updateAnalysisStatus from "../supabase/updateAgentStatus";
import getProfile from "./getProfile";
import getProfileDatasetId from "./getProfileDatasetId";

const analyzeProfile = async (
  pilot_id: string | null,
  analysisId: string,
  handle: string,
) => {
  await updateAnalysisStatus(
    pilot_id,
    analysisId,
    Funnel_Type.INSTAGRAM,
    STEP_OF_ANALYSIS.PROFILE,
  );
  const profileDatasetId = await getProfileDatasetId(handle);
  const accountData: any = await getProfile(profileDatasetId, pilot_id);
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
