import getSocialHandles from "../getSocialHandles";
import getArtist from "../supabase/getArtist";
import analyzeProfile from "./analyzeProfile";

const getSocialProfile = async (
  pilot_id: string | null,
  analysisId: string,
  handle: string,
  existingArtistId: string | null,
  socialId?: string
) => {
  console.log(
    "🚀 [getSocialProfile] Starting profile scrape for handle:",
    handle
  );
  console.log("📝 Parameters:", {
    pilot_id,
    analysisId,
    existingArtistId,
    socialId,
  });

  let scrapedProfile, scrapedPostUrls, analyzedProfileError;

  console.log("📝 [getSocialProfile] Analyzing profile...");
  const { profile, latestPosts, error } = await analyzeProfile(
    pilot_id,
    analysisId,
    handle,
    socialId
  );

  scrapedProfile = profile;
  scrapedPostUrls = latestPosts;
  analyzedProfileError = error;

  if (!scrapedProfile || analyzedProfileError) {
    console.log(
      "⚠️ [getSocialProfile] Initial profile scrape failed, trying with social handles lookup"
    );
    const existingArtist = await getArtist(existingArtistId);
    console.log("📝 [getSocialProfile] Existing artist:", existingArtist);

    const handles = await getSocialHandles(existingArtist?.name || handle);
    console.log("📝 [getSocialProfile] Found social handles:", handles);

    const { profile, latestPosts, error } = await analyzeProfile(
      pilot_id,
      analysisId,
      handles.instagram.replace(/@/g, ""),
      socialId
    );
    analyzedProfileError = error;
    scrapedProfile = profile;
    scrapedPostUrls = latestPosts;
  }

  console.log("📝 [getSocialProfile] Results:", {
    hasProfile: !!scrapedProfile,
    hasError: !!analyzedProfileError,
    postCount: scrapedPostUrls?.length,
  });

  return {
    scrapedProfile,
    analyzedProfileError,
    scrapedPostUrls,
  };
};

export default getSocialProfile;
