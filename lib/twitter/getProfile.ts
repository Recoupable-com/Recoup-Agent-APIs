import extracMails from "../extracMails";
import { ScrapedProfile } from "../scraping/types";

const getProfile = async (
  scraper: any,
  handle: string
): Promise<{ profile: ScrapedProfile | null; email: string | null }> => {
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
        description: bio,
        followerCount,
        followingCount,
        profile_url: `https://x.com/${handle}`,
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

export default getProfile;
