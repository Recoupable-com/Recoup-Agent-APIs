import * as cheerio from "cheerio";
import axios from "axios";
import extracMails from "../extracMails";

const getFanProfile = async (handle: string) => {
  try {
    const profilePageUrl = `https://tiktok.com/@${handle}`;
    const response = await axios.get(profilePageUrl);
    let $ = cheerio.load(response.data);

    const followerCount = $("[title='Followers']");
    const bio = $("[data-e2e='user-bio']");
    const avatar = $("[class*='ImgAvatar']");

    // const email = extracMails(bio);

    return {
      followerCount,
      data: response.data,
      avatar,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getFanProfile;
