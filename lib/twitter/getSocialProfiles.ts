import saveAccount from "../supabase/saveAccount";
import saveAccountEmail from "../supabase/saveAccountEmail";
import saveFanSegment from "../supabase/saveFanSegment";
import saveSocial from "../supabase/saveSocial";
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
        const { profile, email } = await getFanProfile(scraper, handle);
        const fanAccount = await saveAccount({
          name: profile?.username || "",
        });
        await saveAccountEmail({
          account_id: artistId,
          email,
        });
        await saveSocial({
          account_id: fanAccount.id,
          ...profile,
        });
        saveFanSegment({
          account_id: fanAccount.id,
          artistId,
          segment_name: segment,
        });
        return profile;
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
