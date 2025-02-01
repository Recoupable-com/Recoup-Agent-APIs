import runInstagramAgent from "../agents/runInstagramAgent";
import runSpotifyAgent from "../agents/runSpotifyAgent";
import runTikTokAgent from "../agents/runTikTokAgent";
import runTwitterAgent from "../agents/runTwitterAgent";
import { Funnel_Type } from "../lib/funnels";
import { Request, Response } from "express";

export const run_agent = async (req: Request, res: Response) => {
  try {
    const { handles, type, artistId } = req.query ;
    
    const agent_type = Object.values(Funnel_Type).find(
      (value) => value === type,
    );
    if (!agent_type)
      return res.status(500).json({ message: "Agent type is invalid." });

    const isWrapped = type === Funnel_Type.WRAPPED;

    if (isWrapped || type === Funnel_Type.INSTAGRAM)
      runInstagramAgent(
        handles["instagram"],
        artistId
      );
    if (isWrapped || type === Funnel_Type.TWITTER)
      runTwitterAgent(
        handles["twitter"],
        artistId
      );
    if (isWrapped || type === Funnel_Type.TIKTOK)
      runTikTokAgent(
        handles["tiktok"],
        artistId
      );
    if (isWrapped || type === Funnel_Type.SPOTIFY)
      runSpotifyAgent(
        handles["spotify"],
        artistId
      );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};
