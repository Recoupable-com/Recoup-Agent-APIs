import { STEP_OF_ANALYSIS } from "../step";
import supabase from "./serverClient";

const beginAnalysis = async (
  pilotId: string,
  handle: string,
  funnel_type: string | null = null,
  artistId: string | null = null,
) => {
  const { data: new_analytics } = await supabase
    .from("funnel_analytics")
    .insert({
      pilot_id: pilotId,
      handle,
      status: STEP_OF_ANALYSIS.INITIAL,
      type: funnel_type ? funnel_type.toUpperCase() : funnel_type,
      artist_id: artistId || "00000000-0000-0000-0000-000000000000",
    })
    .select("*")
    .single();

  return new_analytics;
};

export default beginAnalysis;
