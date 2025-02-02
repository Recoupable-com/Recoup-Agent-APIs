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
    if (!agent_type) {
      console.error("❌ [PilotController] Invalid agent_type:", type);
      return res.status(500).json({ message: "Agent type is invalid." });
    }
    console.log("✅ [PilotController] Agent type valid:", agent_type);

    const isWrapped = type === Funnel_Type.WRAPPED;
    const { agent } = await createAgent();
    if (!agent?.id || !handles) return;

    if (isWrapped || type === Funnel_Type.TIKTOK)
      runTikTokAgent(
        agent.id,
        handles["tiktok"].replaceAll("@", ""),
        artistId as string,
      );
    if (isWrapped || type === Funnel_Type.TWITTER)
      runTwitterAgent(
        agent.id,
        handles["twitter"].replaceAll("@", ""),
        artistId as string,
      );
    if (isWrapped || type === Funnel_Type.INSTAGRAM)
      runInstagramAgent(
        agent.id,
        handles["instagram"].replaceAll("@", ""),
        artistId as string,
      );
    if (isWrapped || type === Funnel_Type.SPOTIFY)
      runSpotifyAgent(
        agent.id,
        handles["spotify"].replaceAll("@", ""),
        artistId as string,
      );
    return res.status(200).json({ agentId: agent.id });
  } catch (error) {
    console.error("❌ [PilotController] Error in run_agent:", error);
    return res.status(500).json({ error });
  }
};
