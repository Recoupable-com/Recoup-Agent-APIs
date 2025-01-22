import { Funnel_Type } from "../funnels";
import { STEP_OF_ANALYSIS } from "../step";
import getArtist from "../supabase/getArtist";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus";
import getFormattedProfile from "./getFormattedProfile";
import getSocialHandles from "../getSocialHandles";

const getSocialProfile = async (
  scraper: any,
  chat_id: string | null,
  analysisId: string,
  handle: string,
  existingArtistId: string | null,
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
    scrapedProfile = await scraper.getProfile(
      handles.twitter.replace(/@/g, ""),
    );
  }

  return getFormattedProfile(scrapedProfile);
};

export default getSocialProfile;
