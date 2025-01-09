import getInstagramAnalysis from "../agents/getInstagramAnalysis.js";
import getSpotifyAnalysis from "../agents/getSpotifyAnalysis.js";
import getTikTokAnalysis from "../agents/getTikTokAnalysis.js";
import getTwitterAnalysis from "../agents/getTwitterAnalysis.js";
import { Funnel_Type } from "../lib/funnels.js";
import { v4 as uuidV4 } from "uuid";

export const run_agent = async (req, res) => {
  try {
    const { handle, type } = req.query;
    const agent_type = Object.values(Funnel_Type).find(
      (value) => value === type,
    );
    if (!agent_type)
      return res.status(500).json({ message: "Agent type is invalid." });
    const pilotId = uuidV4();
    res.status(200).json({ pilotId });
    const isWrapped = type === Funnel_Type.WRAPPED;
    if (isWrapped || type === Funnel_Type.INSTAGRAM)
      getInstagramAnalysis(handle, pilotId, null, null, isWrapped);
    if (isWrapped || type === Funnel_Type.TWITTER)
      getTwitterAnalysis(handle, pilotId, null, null, isWrapped);
    if (isWrapped || type === Funnel_Type.TIKTOK)
      getTikTokAnalysis(handle, pilotId, null, null, isWrapped);
    if (isWrapped || type === Funnel_Type.SPOTIFY)
      getSpotifyAnalysis(handle, pilotId, null, null, isWrapped);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};
