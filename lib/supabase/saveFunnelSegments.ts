import supabase from "./serverClient";

const saveFunnelSegments = async (segments: any) => {
  const { data } = await supabase
    .from("funnel_analytics_segments")
    .insert(segments)
    .select("*");

  return data;
};

export default saveFunnelSegments;
