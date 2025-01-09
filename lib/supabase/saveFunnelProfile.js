import supabase from "./serverClient.js";

const saveFunnelProfile = async (profile) => {
  const { data, error } = await supabase
    .from("funnel_analytics_profile")
    .insert(profile)
    .select("*")
    .single();

  console.log("ZIAD HERE", error)
  return data;
};

export default saveFunnelProfile;
