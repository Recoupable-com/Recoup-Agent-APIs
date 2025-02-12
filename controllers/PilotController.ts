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
      console.error("❌ [PilotController] No handles provided");
      return res.status(400).json({ message: "No handles provided." });
    }

    const { agent } = await createAgent();
    if (!agent?.id) {
      console.error("❌ [PilotController] Failed to create agent");
      return res.status(500).json({ message: "Failed to create agent." });
    }

    let agentsStarted = 0;

    // TikTok
    if (handles["tiktok"] && handles["tiktok"].trim()) {
      console.log(
        "✅ [PilotController] Starting TikTok agent for handle:",
        handles["tiktok"]
      );
      runTikTokAgent(
        agent.id,
        handles["tiktok"].replaceAll("@", ""),
        artistId as string
      );
      agentsStarted++;
    }

    // Twitter
    if (handles["twitter"] && handles["twitter"].trim()) {
      console.log(
        "✅ [PilotController] Starting Twitter agent for handle:",
        handles["twitter"]
      );
      runTwitterAgent(
        agent.id,
        handles["twitter"].replaceAll("@", ""),
        artistId as string
      );
      agentsStarted++;
    }

    // Instagram
    if (handles["instagram"] && handles["instagram"].trim()) {
      console.log(
        "✅ [PilotController] Starting Instagram agent for handle:",
        handles["instagram"]
      );
      runInstagramAgent(
        agent.id,
        handles["instagram"].replaceAll("@", ""),
        artistId as string
      );
      agentsStarted++;
    }

    // Spotify
    if (handles["spotify"] && handles["spotify"].trim()) {
      console.log(
        "✅ [PilotController] Starting Spotify agent for handle:",
        handles["spotify"]
      );
      runSpotifyAgent(
        agent.id,
        handles["spotify"].replaceAll("@", ""),
        artistId as string
      );
      agentsStarted++;
    }

    if (agentsStarted === 0) {
      console.warn("⚠️ [PilotController] No valid handles found to process");
      return res
        .status(400)
        .json({ message: "No valid handles found to process." });
    }

    console.log(
      `✅ [PilotController] Successfully started ${agentsStarted} agents`
    );
    return res.status(200).json({ agentId: agent.id, agentsStarted });
  } catch (error) {
    console.error("❌ [PilotController] Error in run_agent:", error);
    return res.status(500).json({ error });
  }
};
