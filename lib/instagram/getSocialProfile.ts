import getSocialHandles from "../getSocialHandles";
import getArtist from "../supabase/getArtist";
import analyzeProfile from "./analyzeProfile";

const getSocialProfile = async (
  chat_id: string | null,
  analysisId: string,
  handle: string,
  existingArtistId: string | null,
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
    const handles = await getSocialHandles(existingArtist?.name || handle);
    const { profile, latestPosts, error } = await analyzeProfile(
      chat_id,
      analysisId,
      handles.instagram.replace(/@/g, ""),
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
