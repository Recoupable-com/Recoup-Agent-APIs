const getAggregatedSocialProfile = (
  funnelAnalyses: any,
  existingArtist: any,
) => {
  const { name, username, region, avatar, bio, followerCount, followingCount } =
    funnelAnalyses.reduce(
      (acc: any, fa: any) => {
        const profile = fa.funnel_analytics_accounts?.[0]?.accounts
          ?.account_socials?.[0] || {
          name: "",
          username: "",
          region: "",
          avatar: "",
          bio: "",
          followerCount: 0,
          followingCount: 0,
        };
        acc.name = existingArtist?.name || profile.username || acc.name || "";
        acc.username = existingArtist?.name || profile.username || acc.username;
        acc.region = profile.region || acc.region || "";
        acc.avatar =
          existingArtist?.image || profile.avatar || acc.avatar || "";
        acc.bio = profile.bio || acc.bio || "";
        acc.followerCount += profile.followerCount || 0;
        acc.followingCount += profile.followingCount || 0;
        return acc;
      },
      {
        name: "",
        username: "",
        region: "",
        avatar: "",
        bio: "",
        followerCount: 0,
        followingCount: 0,
      },
    );

  return { username, name, region, avatar, bio, followerCount, followingCount };
};

export default getAggregatedSocialProfile;
