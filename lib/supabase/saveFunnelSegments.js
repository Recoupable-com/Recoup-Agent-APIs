import supabase from "./serverClient.js";

const saveFunnelSegments = async (segments) => {
  const { data } = await supabase
    .from("funnel_analytics_segments")
    .insert(segments)
    .select("*");

  console.log("ZIAD HERE", segments)
  return data;
};

export default saveFunnelSegments;
