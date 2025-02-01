import extracMails from "../extracMails";

const getFanProfile = async (scraper: any, handle: string) => {
  try {
    const profile: any = await scraper.getProfile(handle);
    const avatar = profile.avatar;
    const bio = profile.biography;
    const followerCount = profile.followersCount;
    const email = extracMails(bio);
    const followingCount = profile.followingCount;

    return {
      profile: {
        avatar,
        bio,
        followerCount,
        followingCount,
        profile_url: `https://twitter.com/${handle}`,
        username: handle,
      },
      email,
    };
  } catch (error) {
    console.error(error);
    return {
      profile: null,
      email: null,
    };
  }
};

export default getFanProfile;
