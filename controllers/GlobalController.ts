import getActorStatus from "../lib/apify/getActorStatus";
import getDataset from "../lib/apify/getDataset";
import supabase from "../lib/supabase/serverClient";
import getSocialHandles from "../lib/getSocialHandles";
import { Stagehand } from "@browserbasehq/stagehand";
import { Request, Response } from "express";
import { z } from "zod";
import { Scraper } from "agent-twitter-client";
import getFansProfiles from "../lib/getFansSegments";
import getTikTokFanProfile from "../lib/tiktok/getFanProfile";
import getTwitterFanProfile from "../lib/twitter/getProfile";
import getSegments from "../lib/getSegments";
import getSegmentsWithIcons from "../lib/getSegmentsWithIcons";

export const get_fans_segments = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.query;
    const fansSegments = await getFansProfiles(reportId as string);

    return res.status(500).json({ data: fansSegments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const get_tiktok_profile = async (req: Request, res: Response) => {
  const { handle } = req.query;
  try {
    const profile = await getTikTokFanProfile(handle as string);
    return res.status(200).json({ profile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const get_twitter_profile = async (req: Request, res: Response) => {
  const { handle } = req.query;
  const scraper = new Scraper();
  try {
    const profile = await getTwitterFanProfile(scraper, handle as string);
    return res.status(200).json({ profile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const get_profile = async (req: Request, res: Response) => {
  const { handle, type } = req.query;

  try {
    const stagehand = new Stagehand({
      env: "LOCAL",
      verbose: 1,
      debugDom: true,
      enableCaching: false,
      headless: true,
      modelName: "gpt-4o-mini",
    });

    await stagehand.init();
    let profileUrl = "";
    if (type === "tiktok") profileUrl = `https://tiktok.com/@${handle}`;

    if (!profileUrl) throw new Error("Invalid handle");

    await stagehand.page.goto(profileUrl);

    const { bio, username, followers, email } = await stagehand.page.extract({
      instruction: "Extract the email, bio, username, followers, of the page.",
      schema: z.object({
        bio: z.string(),
        username: z.string(),
        followers: z.number(),
        email: z.string(),
      }),
    });

    return res.status(200).json({
      success: true,
      data: {
        bio,
        username,
        followers,
        email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const get_dataset_status = async (req: Request, res: Response) => {
  const { datasetId } = req.query;

  try {
    const data = await getActorStatus(datasetId as string);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const get_dataset_items = async (req: Request, res: Response) => {
  const { datasetId } = req.query;

  try {
    const data: any = await getDataset(datasetId as string);
    if (data?.[0]?.error)
      return res.status(500).json({ error: data?.[0]?.error });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const get_social_handles = async (req: Request, res: Response) => {
  const { handle } = req.query;
  try {
    const handles = await getSocialHandles(handle as string);

    return res.status(200).json({
      data: handles,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const get_autopilot = async (req: Request, res: Response) => {
  const { agentId } = req.query;
  try {
    const { data } = await supabase
      .from("agents")
      .select(
        `
        *,
        agent_status (
          *,
          social:socials (
            *,
            social_posts (
              *,
              post_comments (
                *
              )
            )
          )
        )
      `,
      )
      .eq("id", agentId);
    return res.status(200).json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const get_segments = async (req: Request, res: Response) => {
  try {
    const { comments } = req.body;
    const segments = await getSegments(comments);
    const segments_with_icons = await getSegmentsWithIcons(segments);
    return res.status(200).json({ segments_with_icons });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};
