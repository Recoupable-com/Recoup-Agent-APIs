import { Funnel_Type } from "../funnels.js";
import { STEP_OF_ANALYSIS } from "../step.js";
import getArtist from "../supabase/getArtist.js";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus.js";
import getFormattedProfile from "./getFormattedProfile.js";

const getSocialProfile = async (
  scraper,
  chat_id,
  analysisId,
  handle,
  existingArtistId,
) => {
  let scrapedProfile;
  await updateAnalysisStatus(
    chat_id,
    analysisId,
    Funnel_Type.TWITTER,
    STEP_OF_ANALYSIS.PROFILE,
  );

  try {
    scrapedProfile = await scraper.getProfile(handle);
  } catch (error) {
    console.error(error);
    const existingArtist = await getArtist(existingArtistId);
    const handles = await getSocialHandles(existingArtist?.name || handle);
    console.log("ZIAD", handles);
    scrapedProfile = await scraper.getProfile(
      handles.twitter.replaceAll("@", ""),
    );
  }

  return getFormattedProfile(scrapedProfile);
};

export default getSocialProfile;
