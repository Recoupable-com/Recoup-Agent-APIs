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
import getTwitterFanProfile from "../lib/twitter/getFanProfile";

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
  const { pilotId } = req.query;
  try {
    // Get the latest agent_status record for this pilot
    const { data: agentStatus, error: statusError } = await supabase
      .from("agent_status")
      .select("id, agent_id, social_id, status, progress, updated_at")
      .eq("agent_id", pilotId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (statusError) {
      console.error("Failed to fetch agent status:", statusError);
      return res.status(500).json({ error: statusError });
    }

    if (!agentStatus) {
      return res
        .status(404)
        .json({ error: "No analysis found for this pilot ID" });
    }

    return res.status(200).json({
      data: {
        status: agentStatus.status,
        progress: agentStatus.progress,
        updated_at: agentStatus.updated_at,
      },
    });
  } catch (error) {
    console.error("Error in get_autopilot:", error);
    return res.status(500).json({ error });
  }
};
