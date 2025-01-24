import * as cheerio from "cheerio";
import axios from "axios";
import extracMails from "../extracMails";

const getFanProfile = async (handle: string) => {
  try {
    const profilePageUrl = `https://tiktok.com/@${handle}`;
    const response = await axios.get(profilePageUrl);
    let $ = cheerio.load(response.data);

    const followerCount = $("[title='Followers']").html();
    const bio = $("[data-e2e='user-bio']").html();
    const avatar = $("[class*='ImgAvatar']").html();

    // const email = extracMails(bio);

    return {
      data: response.data,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getFanProfile;
