import getInstagramAnalysis from "../agents/getInstagramAnalysis";
import getSpotifyAnalysis from "../agents/getSpotifyAnalysis";
import getTikTokAnalysis from "../agents/getTikTokAnalysis";
import getTwitterAnalysis from "../agents/getTwitterAnalysis";
import { Funnel_Type } from "../lib/funnels";
import { createAgent } from "../lib/supabase/createAgent";
import { Request, Response } from "express";

export const run_agent = async (req: Request, res: Response) => {
  try {
    const { handle, type } = req.query;
    const agent_type = Object.values(Funnel_Type).find(
      (value) => value === type
    );
    if (!agent_type)
      return res.status(500).json({ message: "Agent type is invalid." });

    const { agent, error } = await createAgent();

    if (error || !agent) {
      console.error("Failed to create agent:", error);
      return res
        .status(500)
        .json({ message: error?.message || "Failed to create agent record." });
    }

    const pilotId = agent.id;
    res.status(200).json({ pilotId });

    const isWrapped = type === Funnel_Type.WRAPPED;
    if (isWrapped || type === Funnel_Type.INSTAGRAM)
      getInstagramAnalysis(handle as string, pilotId, null, null, isWrapped);
    if (isWrapped || type === Funnel_Type.TWITTER)
      getTwitterAnalysis(handle as string, pilotId, null, null, isWrapped);
    if (isWrapped || type === Funnel_Type.TIKTOK)
      getTikTokAnalysis(handle as string, pilotId, null, null, isWrapped);
    if (isWrapped || type === Funnel_Type.SPOTIFY)
      getSpotifyAnalysis(handle as string, pilotId, null, null, isWrapped);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};
