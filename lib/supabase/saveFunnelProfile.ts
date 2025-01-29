import supabase from "./serverClient";

const saveFunnelProfile = async (profile: any) => {
  console.log("ZIAD saveFunnelProfile", profile)
  const { data: account } = await supabase
    .from("accounts")
    .insert({
      name: profile?.name || "",
    })
    .select("*")
    .single();

  const { error } = await supabase
    .from("funnel_analytics_accounts")
    .insert({
      account_id: account.id,
      analysis_id: profile.analysis_id,
    })
    .select("*")
    .single();
  console.log("ZIAD funnel_analytics_accounts", error)

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
