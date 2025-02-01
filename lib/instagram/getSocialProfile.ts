import getSocialHandles from "../getSocialHandles";
import getArtist from "../supabase/getArtist";
import analyzeProfile from "./analyzeProfile";
import { createOrGetSocial } from "../supabase/createOrGetSocial";
import savePosts from "../supabase/savePosts";

const getSocialProfile = async (
  pilot_id: string | null,
  analysisId: string,
  handle: string,
  existingArtistId: string | null
) => {
  console.log(
    "🚀 [getSocialProfile] Starting profile scrape for handle:",
    handle
  );
  console.log("📝 Parameters:", { pilot_id, analysisId, existingArtistId });

  let scrapedProfile, scrapedPostUrls, analyzedProfileError, socialId;

  console.log("📝 [getSocialProfile] Analyzing profile...");
  const { profile, latestPosts, error } = await analyzeProfile(
    pilot_id,
    analysisId,
    handle
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
      handles.instagram.replace(/@/g, "")
    );
    analyzedProfileError = error;
    scrapedProfile = profile;
    scrapedPostUrls = latestPosts;
  }

  if (scrapedProfile) {
    // Create or get social record with complete profile data
    console.log("📝 [getSocialProfile] Creating/getting social record...");
    const { social, error: socialError } = await createOrGetSocial(
      scrapedProfile.username,
      `https://instagram.com/${scrapedProfile.username}`,
      scrapedProfile.avatar,
      scrapedProfile.bio,
      scrapedProfile.followerCount,
      scrapedProfile.followingCount,
      null // region is not available from Instagram
    );

    if (socialError || !social) {
      console.error(
        "❌ [getSocialProfile] Failed to create/get social record:",
        socialError
      );
      analyzedProfileError = socialError;
    } else {
      socialId = social.id;
      // Now that we have the socialId, save the posts
      if (scrapedPostUrls?.length > 0) {
        console.log("📝 [getSocialProfile] Saving posts...");
        await savePosts(scrapedPostUrls, socialId);
      }
    }
  }

  console.log("📝 [getSocialProfile] Results:", {
    hasProfile: !!scrapedProfile,
    hasError: !!analyzedProfileError,
    postCount: scrapedPostUrls?.length,
    socialId,
  });

  return {
    scrapedProfile,
    analyzedProfileError,
    scrapedPostUrls,
    socialId,
  };
};

export default getSocialProfile;
