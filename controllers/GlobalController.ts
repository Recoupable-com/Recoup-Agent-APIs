import getActorStatus from "../lib/apify/getActorStatus";
import getDataset from "../lib/apify/getDataset";
import supabase from "../lib/supabase/serverClient";
import getSocialHandles from "../lib/getSocialHandles";
import { Stagehand } from "@browserbasehq/stagehand";
import { Request, Response } from "express";
import { z } from "zod";

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
    let profileUrl = `https://tiktok.com/@${handle}`;
    if (type === "twitter") profileUrl = `https://x.com/${handle}`;

    await stagehand.page.goto(profileUrl);

    const { bio, username, followers } = await stagehand.page.extract({
      instruction: "Extract the bio, username, followers, of the page.",
      schema: z.object({
        bio: z.string(),
        username: z.string(),
        followers: z.number(),
      }),
    });

    return res.status(200).json({
      success: true,
      data: {
        bio,
        username,
        followers,
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
  const { pilotId } = req.query;
  try {
    const { data } = await supabase
      .from("funnel_analytics")
      .select(
        `*,
      funnel_analytics_segments (
        *
      ),
      funnel_analytics_profile (
        *,
        artists (
          *,
          artist_social_links (
            *
          )
        )
      )`,
      )
      .eq("chat_id", pilotId);

    return res.status(200).json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};
