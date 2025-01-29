import { Funnel_Type } from "../funnels";
import { STEP_OF_ANALYSIS } from "../step";
import getArtist from "../supabase/getArtist";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus";
import getFormattedProfile from "./getFormattedProfile";
import getSocialHandles from "../getSocialHandles";

const getSocialProfile = async (
  scraper: any,
  pilot_id: string | null,
  analysisId: string,
  handle: string,
  existingArtistId: string | null,
) => {
  let scrapedProfile;
  await updateAnalysisStatus(
    pilot_id,
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
    try {
      scrapedProfile = await scraper.getProfile(
        handles.twitter.replace(/@/g, ""),
      );
    } catch (error) {
      throw new Error(error as string);
    }
  }

  return getFormattedProfile(scrapedProfile);
};

export default getSocialProfile;
