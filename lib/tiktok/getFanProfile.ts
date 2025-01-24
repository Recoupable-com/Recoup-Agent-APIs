import * as cheerio from "cheerio";
import axios from "axios";
import extracMails from "../extracMails";

const getFanProfile = async (handle: string) => {
  try {
    const profilePageUrl = `https://tiktok.com/@${handle}`;
    const response = await axios.get(profilePageUrl);
    let $ = cheerio.load(response.data);
    const scripts = $("script");

    const a: any = [];
    let userInfo: any = null;
    scripts.each((_, element) => {
      try {
        const scriptContent = $(element).html();
        const scriptSrc = $(element).attr("src");
        a.push(scriptContent || "");
        if (!scriptSrc && scriptContent) {
          const metadata = JSON.parse(scriptContent);
          if (Object.keys(metadata)[0] === "__DEFAULT_SCOPE__")
            userInfo =
              metadata["__DEFAULT_SCOPE__"]["webapp.user-detail"]["userInfo"];
        }
      } catch (error) {
        console.error(error);
      }
    });

    return {
      handle: userInfo?.user?.uniqueId || handle,
      bio: userInfo?.user?.signature || "",
      avatar: userInfo?.user?.avatarThumb || "",
      followerCount: userInfo?.stats?.followerCount || 0,
      email: extracMails(userInfo?.user?.signature || ""),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getFanProfile;
