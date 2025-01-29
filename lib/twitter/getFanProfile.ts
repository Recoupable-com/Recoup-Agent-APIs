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
        type: "TWITTER",
        link: `https://twitter.com/${handle}`,
        username: handle,
      },
      email,
    };
  } catch (error) {
    throw new Error(error as string);
  }
};

export default getFanProfile;
