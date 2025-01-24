import * as cheerio from "cheerio";
import axios from "axios";
import extracMails from "../extracMails";

const getFanProfile = async (handle: string) => {
  try {
    const profilePageUrl = `https://tiktok.com/@sweetman.eth`;
    const response = await axios.get(profilePageUrl);
    let $ = cheerio.load(response.data);

    const followerCount = $("[title='Followers']").text();
    const bio = $("[data-e2e='user-bio']").text();
    const avatar = $("[class*='ImgAvatar']").first().text();

    const email = extracMails(bio);

    return {
      handle,
      followerCount,
      bio,
      avatar,
      email,
      data: response.data
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getFanProfile;
