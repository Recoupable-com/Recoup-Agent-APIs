import { Funnel_Type } from "../funnels.js";
import { STEP_OF_AGENT } from "../step.js";
import updateAgentStatus from "../supabase/updateAgentStatus.js";
import getProfile from "./getProfile.js";
import getProfileDatasetId from "./getProfileDatasetId.js";

const analyzeProfile = async (
  agent_id: string,
  handle: string,
) => {
  await updateAgentStatus(agent_id, Funnel_Type.TIKTOK, STEP_OF_AGENT.PROFILE)
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
