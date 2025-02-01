import analyzeProfile from "./analyzeProfile.js";

const getSocialProfile = async (
  agent_id: string,
  handle: string,
) => {
  let scrapedProfile, scrapedVideoUrls, analyzedProfileError;
  const { profile, videoUrls, error } = await analyzeProfile(agent_id, handle);
  scrapedProfile = profile;
  scrapedVideoUrls = videoUrls;
  analyzedProfileError = error;
  
  return {
    scrapedProfile,
    analyzedProfileError,
    scrapedVideoUrls,
  };
};

export default getSocialProfile;
