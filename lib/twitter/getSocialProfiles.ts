import saveFansProfiles from "../supabase/saveFansProfiles";
import getFanProfile from "./getFanProfile";

const getSocialProfiles = async (
  scraper: any,
  fansSegments: any,
  artistId: string,
) => {
  try {
    const socialProfilesPromise = fansSegments.map(async (fanSegment: any) => {
      try {
        const handle = Object.keys(fanSegment)[0];
        const segment = Object.values(fanSegment)[0];
        const profile = await getFanProfile(scraper, handle);
        const fanProfile = {
          ...profile,
          segment,
          artistId,
        };
        saveFansProfiles(fanProfile);
        return fanProfile;
      } catch (error) {
        console.error(error);
        return null;
      }
    });

    const socialProfiles = await Promise.all(socialProfilesPromise);

    return socialProfiles.filter((profile: any) => profile);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default getSocialProfiles;
