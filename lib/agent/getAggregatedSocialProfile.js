const getAggregatedSocialProfile = (funnelAnalyses) => {
  if (!funnelAnalyses)
    return { region: "", avatar: "", bio: "", followers: 0, followings: 0 };

  const { region, avatar, bio, followers, followings } = funnelAnalyses.reduce(
    (acc, fa) => {
      const profile = fa.funnel_analytics_profile?.[0] || {};
      acc.region = profile.region || acc.region || "";
      acc.avatar = profile.avatar || acc.avatar || "";
      acc.bio = profile.bio || acc.bio || "";
      acc.followers += profile.followers || 0;
      acc.followings += profile.followings || 0;
      return acc;
    },
    { region: "", avatar: "", bio: "", followers: 0, followings: 0 },
  );

  return { region, avatar, bio, followers, followings };
};

export default getAggregatedSocialProfile;
