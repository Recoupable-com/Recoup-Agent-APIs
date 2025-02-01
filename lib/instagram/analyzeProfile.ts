import { Funnel_Type } from "../funnels";
import { STEP_OF_ANALYSIS } from "../step";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus";
import getProfile from "./getProfile";
import getProfileDatasetId from "./getProfileDatasetId";
import savePosts from "../supabase/savePosts";

const analyzeProfile = async (
  pilot_id: string | null,
  analysisId: string,
  handle: string,
  socialId?: string
) => {
  console.log(
    "🚀 [analyzeProfile] Starting profile analysis for handle:",
    handle
  );

  try {
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.PROFILE
    );
    console.log("✅ [analyzeProfile] Updated status to PROFILE");

    console.log("📝 [analyzeProfile] Getting profile dataset ID...");
    const profileDatasetId = await getProfileDatasetId(handle);
    console.log("✅ [analyzeProfile] Got dataset ID:", profileDatasetId);

    console.log("📝 [analyzeProfile] Getting profile data...");
    const accountData: any = await getProfile(profileDatasetId, pilot_id);

    if (accountData?.error) {
      console.error(
        "❌ [analyzeProfile] Error getting profile:",
        accountData.error
      );
      return { error: accountData?.error, profile: null, latestPosts: null };
    }

    const profile = accountData?.profile;
    const latestPosts = accountData?.latestPosts;

    // Save posts if we have a socialId
    if (socialId && latestPosts?.length > 0) {
      console.log("📝 [analyzeProfile] Saving posts...");
      await savePosts(latestPosts, socialId);
    }

    console.log("✅ [analyzeProfile] Analysis complete:", {
      hasProfile: !!profile,
      postCount: latestPosts?.length,
    });

    return {
      profile,
      latestPosts,
      error: false,
    };
  } catch (error) {
    console.error("❌ [analyzeProfile] Error:", error);
    return { error: true, profile: null, latestPosts: null };
  }
};

export default analyzeProfile;
