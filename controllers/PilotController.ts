import runInstagramAgent from "../agents/runInstagramAgent";
import runSpotifyAgent from "../agents/runSpotifyAgent";
import runTikTokAgent from "../agents/runTikTokAgent";
import runTwitterAgent from "../agents/runTwitterAgent";
import { Request, Response } from "express";
import { createAgent } from "../lib/supabase/createAgent";

export const run_agent = async (req: Request, res: Response) => {
  try {
    const { handles, artistId } = req.body;

    if (!handles) {
      console.error("❌ No handles provided");
      return res.status(400).json({ message: "No handles provided." });
    }

    const { agent } = await createAgent();
    if (!agent?.id) {
      console.error("❌ Failed to create agent");
      return res.status(500).json({ message: "Failed to create agent." });
    }

    let hasValidHandle = false;

    if (handles["tiktok"] && handles["tiktok"].trim()) {
      runTikTokAgent(
        agent.id,
        handles["tiktok"].replaceAll("@", ""),
        artistId as string
      );
      hasValidHandle = true;
    }

    if (handles["twitter"] && handles["twitter"].trim()) {
      runTwitterAgent(
        agent.id,
        handles["twitter"].replaceAll("@", ""),
        artistId as string
      );
      hasValidHandle = true;
    }

    if (handles["instagram"] && handles["instagram"].trim()) {
      runInstagramAgent(
        agent.id,
        handles["instagram"].replaceAll("@", ""),
        artistId as string
      );
      hasValidHandle = true;
    }

    if (handles["spotify"] && handles["spotify"].trim()) {
      runSpotifyAgent(
        agent.id,
        handles["spotify"].replaceAll("@", ""),
        artistId as string
      );
      hasValidHandle = true;
    }

    if (!hasValidHandle) {
      return res
        .status(400)
        .json({ message: "No valid handles found to process." });
    }

    return res.status(200).json({ agentId: agent.id });
  } catch (error) {
    console.error("❌ Error in run_agent:", error);
    return res.status(500).json({ error });
  }
};
