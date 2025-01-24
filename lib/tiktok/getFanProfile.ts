import * as cheerio from "cheerio";
import extracMails from "../extracMails";
import { Stagehand } from "@browserbasehq/stagehand";

const getFanProfile = async (handle: string) => {
  try {
    const profilePageUrl = `https://tiktok.com/${handle}`;
    const stagehand = new Stagehand({
      env: "LOCAL",
      verbose: 1,
      debugDom: true,
      enableCaching: false,
      headless: true,
      modelName: "gpt-4o-mini",
    });

    await stagehand.init();
    await stagehand.page.goto(profilePageUrl);
    await stagehand.page.waitForLoadState("networkidle");
    const pageContent = await stagehand.page.content();
    console.log("ZIAD", pageContent);
    let $ = cheerio.load(pageContent);

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
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getFanProfile;
