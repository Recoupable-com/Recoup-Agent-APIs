import getActorStatus from "../lib/apify/getActorStatus";
import getDataset from "../lib/apify/getDataset";
import supabase from "../lib/supabase/serverClient";
import getSocialHandles from "../lib/getSocialHandles";
import { Stagehand } from "@browserbasehq/stagehand";
import { Request, Response } from "express";
import { z } from "zod";
import getChatCompletions from "../lib/getChatCompletions";
import getFunnelAnalysis from "../lib/supabase/getFunnelAnalysis";
import { instructions } from "../lib/instructions";

export const get_fans_segments = async (req: Request, res: Response) => {
  try {
    const twitter_analytics_id = "e5f3e98b-2af0-4740-8eb4-fd0718e0535c";
    const data: any = await getFunnelAnalysis(twitter_analytics_id);
    const segments = data.funnel_analytics_segments.map(
      (segment: any) => segment.name,
    );
    const comments = data.funnel_analytics_comments.map((comment: any) => ({
      username: comment.username,
      comment: comment.comment,
    }));

    const context = JSON.stringify(segments, comments);

    const content = await getChatCompletions(
      [
        {
          role: "user",
          content: `
        [COMMENTS]: ${JSON.stringify(comments)}
        [SEGMENTS]: ${JSON.stringify(segments)}`,
        },
        {
          role: "system",
          content: `${instructions.sort_fans_on_segments} \n Response should be in JSON format. {"data": [{ "string": string }, { "string": string }]}.`,
        },
      ],
      2222,
    );

    res.status(500).json({ content, segments, comments });
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
