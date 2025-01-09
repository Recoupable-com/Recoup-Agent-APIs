import { STEP_OF_ANALYSIS } from "../step.js";
import supabase from "./serverClient.js";

const beginAnalysis = async (chat_id, handle, funnel_type = null) => {
  const { data } = await supabase
    .from("funnel_analytics")
    .insert({
      chat_id,
      handle,
      status: STEP_OF_ANALYSIS.INITIAL,
      type: funnel_type ? funnel_type.toUpperCase() : funnel_type,
    })
    .select("*")
    .single();

  return data;
};

export default beginAnalysis;
