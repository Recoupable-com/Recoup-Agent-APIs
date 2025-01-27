import { STEP_OF_ANALYSIS } from "../step";
import supabase from "./serverClient";

const beginAnalysis = async (
  chat_id: string,
  handle: string,
  funnel_type: string | null = null,
  artistId: string | null,
) => {
  const { data } = await supabase
    .from("funnel_analytics")
    .insert({
      chat_id,
      handle,
      status: STEP_OF_ANALYSIS.INITIAL,
      type: funnel_type ? funnel_type.toUpperCase() : funnel_type,
      artistId: artistId || "00000000-0000-0000-0000-000000000000",
    })
    .select("*")
    .single();

  return data;
};

export default beginAnalysis;
