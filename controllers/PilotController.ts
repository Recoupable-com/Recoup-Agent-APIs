import getInstagramAnalysis from "../agents/getInstagramAnalysis";
import getSpotifyAnalysis from "../agents/getSpotifyAnalysis";
import getTikTokAnalysis from "../agents/getTikTokAnalysis";
import getTwitterAnalysis from "../agents/getTwitterAnalysis";
import { Funnel_Type } from "../lib/funnels";
import { createAgent } from "../lib/supabase/createAgent";
import { Request, Response } from "express";

export const run_agent = async (req: Request, res: Response) => {
  try {
    console.log(
      "🚀 [PilotController] Starting run_agent with query:",
      req.query
    );
    const { handle, type } = req.query;

    console.log("📝 [PilotController] Validating agent_type:", type);
    const agent_type = Object.values(Funnel_Type).find(
      (value) => value === type
    );
    if (!agent_type) {
      console.error("❌ [PilotController] Invalid agent_type:", type);
      return res.status(500).json({ message: "Agent type is invalid." });
    }
    console.log("✅ [PilotController] Agent type valid:", agent_type);

    console.log("📝 [PilotController] Creating agent record...");
    const { agent, error } = await createAgent();

    if (error || !agent) {
      console.error("❌ [PilotController] Failed to create agent:", error);
      return res
        .status(500)
        .json({ message: error?.message || "Failed to create agent record." });
    }

    const pilotId = agent.id;
    console.log(
      "✅ [PilotController] Agent created successfully with ID:",
      pilotId
    );

    res.status(200).json({ pilotId });

    const isWrapped = type === Funnel_Type.WRAPPED;
    console.log(
      "📝 [PilotController] Starting analysis. isWrapped:",
      isWrapped
    );

    if (isWrapped || type === Funnel_Type.INSTAGRAM) {
      console.log(
        "🔄 [PilotController] Starting Instagram analysis for handle:",
        handle
      );
      getInstagramAnalysis(handle as string, pilotId, null, null, isWrapped);
    }
    if (isWrapped || type === Funnel_Type.TWITTER) {
      console.log(
        "🔄 [PilotController] Starting Twitter analysis for handle:",
        handle
      );
      getTwitterAnalysis(handle as string, pilotId, null, null, isWrapped);
    }
    if (isWrapped || type === Funnel_Type.TIKTOK) {
      console.log(
        "🔄 [PilotController] Starting TikTok analysis for handle:",
        handle
      );
      getTikTokAnalysis(handle as string, pilotId, null, null, isWrapped);
    }
    if (isWrapped || type === Funnel_Type.SPOTIFY) {
      console.log(
        "🔄 [PilotController] Starting Spotify analysis for handle:",
        handle
      );
      getSpotifyAnalysis(handle as string, pilotId, null, null, isWrapped);
    }
  } catch (error) {
    console.error("❌ [PilotController] Error in run_agent:", error);
    return res.status(500).json({ error });
  }
};
