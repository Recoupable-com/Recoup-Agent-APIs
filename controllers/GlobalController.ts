import getActorStatus from "../lib/apify/getActorStatus";
import getDataset from "../lib/apify/getDataset";
import supabase from "../lib/supabase/serverClient";
import getSocialHandles from "../lib/getSocialHandles";
import { Stagehand } from "@browserbasehq/stagehand";
import { Request, Response } from "express";
import { z } from "zod";
import { Scraper } from "agent-twitter-client";
import getFanSegments from "../lib/getFanSegments";
import getTikTokFanProfile from "../lib/tiktok/getFanProfile";
import getTwitterFanProfile from "../lib/twitter/getProfile";
import getSegments from "../lib/getSegments";
import getSegmentsWithIcons from "../lib/getSegmentsWithIcons";
import getPostComments from "../lib/agent/getPostComments";
import isAgentRunning from "../lib/isAgentRunning";
import connectFansSegmentsToArtist from "../lib/supabase/connectFansSegmentsToArtist";
import { AgentService } from "../lib/services/AgentService";
import { getAccountSocials } from "../lib/supabase/getAccountSocials";
import getArtistPosts from "../lib/supabase/getArtistPosts";
import getArtistFans from "../lib/supabase/getArtistFans";

const agentService = new AgentService();

export const get_fans_segments = async (req: Request, res: Response) => {
  try {
    const { segmentNames, commentIds } = req.body;
    const comments = [];
    const chunkSize = 100;
    const chunkCount =
      parseInt(Number(commentIds.length / chunkSize).toFixed(0), 10) + 1;
    for (let i = 0; i < chunkCount; i++) {
      const chunkCommentIds = commentIds.slice(
        chunkSize * i,
        chunkSize * (i + 1)
      );
      const { data: post_comments } = await supabase
        .from("post_comments")
        .select("*, social:socials(*)")
        .in("id", chunkCommentIds);
      if (post_comments) {
        comments.push(post_comments.flat());
        if (comments.flat().length > 500) break;
      }
    }

    while (1) {
      const fansSegments = await getFanSegments(
        segmentNames,
        comments.flat().slice(0, 500)
      );
      if (fansSegments.length) {
        return res.status(200).json({ data: fansSegments });
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const connect_fans_segments_to_artist = async (
  req: Request,
  res: Response
) => {
  const { fansSegments, artistId } = req.body;
  try {
    await connectFansSegmentsToArtist(fansSegments, artistId);
    return res.status(200).json({ success: true });
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

export const get_agent = async (req: Request, res: Response) => {
  const { agentId } = req.query;
  if (!agentId || typeof agentId !== "string") {
    return res.status(400).json({ error: "Invalid agent ID" });
  }

  try {
    const { data, error } = await agentService.getAgentStatus(agentId);
    if (error || !data) {
      console.error("Error getting agent status:", error);
      return res
        .status(500)
        .json({ error: error?.message || "Failed to get agent status" });
    }

    const { agent, statuses } = data;
    const formattedAgent = {
      ...agent,
      agent_status: statuses.map((status) => ({
        ...status,
        social: null, // Will be populated below
      })),
    };

    // Get social data for each status
    for (const status of formattedAgent.agent_status) {
      if (status.social_id) {
        const { data: social } = await supabase
          .from("socials")
          .select("*")
          .eq("id", status.social_id)
          .single();
        status.social = social;
      }
    }

    // Check if agent is still running
    if (isAgentRunning(formattedAgent.agent_status)) {
      return res.status(200).json({ agent: formattedAgent });
    }

    // Get comments if agent is finished
    const comments = await getPostComments(formattedAgent.agent_status);
    return res.status(200).json({ agent: formattedAgent, comments });
  } catch (error) {
    console.error("Error in get_agent:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Unknown error in get_agent",
    });
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

export const get_account_socials = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.query;

    if (!accountId || typeof accountId !== "string") {
      return res.status(400).json({
        status: "error",
        message: "accountId is required and must be a string",
      });
    }

    const result = await getAccountSocials(accountId);
    res.json(result);
  } catch (error) {
    console.error("[ERROR] Error in get_account_socials:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const get_posts = async (req: Request, res: Response) => {
  const { artist_account_id } = req.query;

  if (!artist_account_id) {
    return res.status(400).json({
      status: "error",
      message: "Missing required parameter: artist_account_id",
    });
  }

  try {
    const { status, posts } = await getArtistPosts(artist_account_id as string);

    if (status === "error") {
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch posts",
      });
    }

    return res.status(200).json({
      status: "success",
      posts,
    });
  } catch (error) {
    console.error("[ERROR] Error in get_posts:", error);
    return res.status(500).json({
      status: "error",
      message: "An unexpected error occurred",
    });
  }
};

export const get_fans = async (req: Request, res: Response) => {
  const { artist_account_id, limit = 20, page = 1 } = req.query;
  if (!artist_account_id || typeof artist_account_id !== "string") {
    return res.status(400).json({ error: "Invalid artist_account_id" });
  }

  const parsedLimit = Math.min(Number(limit) || 20, 100);
  const parsedPage = Math.max(Number(page) || 1, 1);

  try {
    const result = await getArtistFans(artist_account_id, {
      limit: parsedLimit,
      page: parsedPage,
    });

    return res.status(200).json({
      status: result.status,
      fans: result.socials,
      pagination: {
        total_count: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        total_pages:
          Math.ceil(result.pagination.total / result.pagination.limit) || 1,
      },
    });
  } catch (error) {
    console.error("Error in get_fans:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Unknown error in get_fans",
    });
  }
};
