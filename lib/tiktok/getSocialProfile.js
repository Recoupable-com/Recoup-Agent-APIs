import getSocialHandles from "../getSocialHandles.js";
import getArtist from "../supabase/getArtist.js";
import analyzeProfile from "./analyzeProfile.js";

const getSocialProfile = async (
  chat_id,
  analysisId,
  handle,
  existingArtistId,
) => {
  let scrapedProfile, scrapedVideoUrls, analyzedProfileError;
  const { profile, videoUrls, error } = await analyzeProfile(
    chat_id,
    analysisId,
    handle,
  );
  scrapedProfile = profile;
  scrapedVideoUrls = videoUrls;
  analyzedProfileError = error;
  if (!scrapedProfile || analyzedProfileError) {
    const existingArtist = await getArtist(existingArtistId);
    const handles = await getSocialHandles(existingArtist?.name || handle);
    const { profile, videoUrls, error } = await analyzeProfile(
      handles.tiktok.replaceAll("@", ""),
    );
    analyzedProfileError = error;
    scrapedProfile = profile;
    scrapedVideoUrls = videoUrls;
  }

  return {
    scrapedProfile,
    analyzedProfileError,
    scrapedVideoUrls,
  };
};

export default getSocialProfile;
