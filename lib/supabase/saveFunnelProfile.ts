import supabase from "./serverClient";

const saveFunnelProfile = async (profile: any) => {
  const { data: account } = await supabase
    .from("accounts")
    .insert({
      name: profile?.name || "",
    })
    .select("*")
    .single();

  await supabase
    .from("funnel_analytics_accounts")
    .insert({
      account_id: account.id,
      analysis_id: profile.analysis_id,
    })
    .select("*")
    .single();

  await supabase.from("account_socials").insert({
    account_id: account.id,
    bio: profile?.bio || "",
    avatar: profile?.avatar || "",
    followingCount: profile?.followingCount || 0,
    followerCount: profile?.followerCount || 0,
    region: profile?.region || "",
    username: profile?.username || "",
  });
};

export default saveFunnelProfile;
