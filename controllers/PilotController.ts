import runInstagramAgent from "../agents/runInstagramAgent";
import runSpotifyAgent from "../agents/runSpotifyAgent";
import runTikTokAgent from "../agents/runTikTokAgent";
import runTwitterAgent from "../agents/runTwitterAgent";
import { Funnel_Type } from "../lib/funnels";
import { Request, Response } from "express";
import { createAgent } from "../lib/supabase/createAgent";

export const run_agent = async (req: Request, res: Response) => {
  try {
    const { handles, type } = req.body;
    console.log("🔍 [PilotController] Received request:", { type, handles });

    // Validate agent type
    const agent_type = Object.values(Funnel_Type).find(
      (value) => value === type,
    );
    if (!agent_type) {
      console.error("❌ [PilotController] Invalid agent_type:", type);
      return res.status(500).json({ message: "Agent type is invalid." });
    }
    console.log("✅ [PilotController] Agent type valid:", agent_type);

    // Validate handles
    if (!handles) {
      console.error("❌ [PilotController] No handles provided");
      return res.status(400).json({ message: "Social handles are required." });
    }

    // Create agent
    const { agent } = await createAgent();
    if (!agent?.id || !handles) {
      return res.status(500).json({ message: "Failed to create agent or missing handles." });
    }

    const isWrapped = type === Funnel_Type.WRAPPED;
    
    // Track social IDs for response
    const social_ids: { [key: string]: string | null } = {};
    let errors: { [key: string]: string | null } = {};

    // Run appropriate agents
    if (isWrapped || type === Funnel_Type.TIKTOK) {
      const tiktokHandle = handles["tiktok"].replaceAll("@", "");
      runTikTokAgent(agent.id, tiktokHandle);
    }
    if (isWrapped || type === Funnel_Type.TWITTER) {
      const twitterHandle = handles["twitter"].replaceAll("@", "");
      runTwitterAgent(agent.id, twitterHandle);
    }
    if (isWrapped || type === Funnel_Type.INSTAGRAM) {
      const instagramHandle = handles["instagram"].replaceAll("@", "");
      const { social_id, error } = await runInstagramAgent(agent.id, instagramHandle);
      social_ids.instagram = social_id;
      if (error) errors.instagram = error.message;
    }
    if (isWrapped || type === Funnel_Type.SPOTIFY) {
      const spotifyHandle = handles["spotify"].replaceAll("@", "");
      runSpotifyAgent(agent.id, spotifyHandle);
    }

    console.log("✅ [PilotController] Successfully started agent:", agent.id);
    return res.status(200).json({ 
      agentId: agent.id,
      social_ids,
      errors: Object.keys(errors).length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("❌ [PilotController] Error in run_agent:", error);
    return res.status(500).json({ error });
  }
};
