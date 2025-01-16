import getSocialHandles from "../getSocialHandles.js";
import getArtist from "../supabase/getArtist.js";
import analyzeProfile from "./analyzeProfile.js";

const getSocialProfile = async (
  chat_id,
  analysisId,
  handle,
  existingArtistId,
) => {
  let scrapedProfile, scrapedPostUrls, analyzedProfileError;
  const { profile, latestPosts, error } = await analyzeProfile(
    chat_id,
    analysisId,
    handle,
  );
  scrapedProfile = profile;
  scrapedPostUrls = latestPosts;
  analyzedProfileError = error;
  if (!scrapedProfile || analyzedProfileError) {
    const existingArtist = await getArtist(existingArtistId);
    console.log("ZIAD HANDLE", existingArtist, existingArtist?.name, handle);
    const handles = await getSocialHandles(existingArtist?.name || handle);
    console.log("ZIAD", handles);
    const { profile, latestPosts, error } = await analyzeProfile(
      handles.instagram.replaceAll("@", ""),
    );
    analyzedProfileError = error;
    scrapedProfile = profile;
    scrapedPostUrls = latestPosts;
  }

  return {
    scrapedProfile,
    analyzedProfileError,
    scrapedPostUrls,
  };
};

export default getSocialProfile;
