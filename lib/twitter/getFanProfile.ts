import axios from "axios";
import * as cheerio from "cheerio";

const getFanProfile = async (handle: string) => {
  const profilePageUrl = `https://x.com/${handle}`;
  const response = await axios.get(profilePageUrl);
  let $ = cheerio.load(response.data);

  const followerCount = $("[href*='verified_followers']").first();

  return {
    followerCount,
    content: response.data
  };
};

export default getFanProfile;
