import supabase from "./serverClient";

const saveFunnelProfile = async (profile: any) => {
  const { data } = await supabase
    .from("funnel_analytics_profile")
    .insert(profile)
    .select("*")
    .single();

  return data;
};

export default saveFunnelProfile;
