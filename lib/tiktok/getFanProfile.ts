import extracMails from "../extracMails";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

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
    const { bio, followerCount, avatarUrl } = await stagehand.page.extract({
      instruction: "Extract the bio, followers, avatarUrl of the page.",
      schema: z.object({
        bio: z.string(),
        followerCount: z.number(),
        avatarUrl: z.string(),
      }),
      domSettleTimeoutMs: 5000,
    });

    const email = extracMails(bio);

    return {
      handle,
      followerCount,
      bio,
      avatar: avatarUrl,
      email,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getFanProfile;
