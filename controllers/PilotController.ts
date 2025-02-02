import runInstagramAgent from "../agents/runInstagramAgent";
import runSpotifyAgent from "../agents/runSpotifyAgent";
import runTikTokAgent from "../agents/runTikTokAgent";
import runTwitterAgent from "../agents/runTwitterAgent";
import { Funnel_Type } from "../lib/funnels";
import { Request, Response } from "express";
import { createAgent } from "../lib/supabase/createAgent";

export const run_agent = async (req: Request, res: Response) => {
  try {
    const { handles, type, artistId } = req.body;
    const agent_type = Object.values(Funnel_Type).find(
      (value) => value === type,
    );
    if (!agent_type)
      return res.status(500).json({ message: "Agent type is invalid." });

    const isWrapped = type === Funnel_Type.WRAPPED;
    const { agent } = await createAgent();
    if (!agent?.id || !handles) return;
    res.status(200).json({ agentId: agent.id });

    if (isWrapped || type === Funnel_Type.TIKTOK)
      runTikTokAgent(agent.id, handles["tiktok"], artistId as string);
    if (isWrapped || type === Funnel_Type.TWITTER)
      runTwitterAgent(agent.id, handles["twitter"], artistId as string);
    if (isWrapped || type === Funnel_Type.INSTAGRAM)
      runInstagramAgent(agent.id, handles["instagram"], artistId as string);
    if (isWrapped || type === Funnel_Type.SPOTIFY)
      runSpotifyAgent(agent.id, handles["spotify"], artistId as string);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};
