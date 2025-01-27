import getFanProfile from "./getFanProfile";

const getSocialProfiles = async (fansSegments: any) => {
  const socialProfilesPromise = fansSegments.map(async (fanSegment: any) => {
    try {
      const handle = Object.keys(fanSegment)[0];
      const profile = await getFanProfile(handle);

      return profile;
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  const socialProfiles = await Promise.all(socialProfilesPromise);

  return socialProfiles;
};

export default getSocialProfiles;
