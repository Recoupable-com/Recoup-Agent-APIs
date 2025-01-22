const getAggregatedSocialProfile = (
  funnelAnalyses: any,
  existingArtist: any,
) => {
  const { name, nickname, region, avatar, bio, followers, followings } =
    funnelAnalyses.reduce(
      (acc: any, fa: any) => {
        const profile = fa.funnel_analytics_profile?.[0] || {
          name: "",
          nickname: "",
          region: "",
          avatar: "",
          bio: "",
          followers: 0,
          followings: 0,
        };
        acc.name = existingArtist?.name || profile.name || acc.name || "";
        acc.nickname = existingArtist?.name || profile.nickname || acc.nickname;
        acc.region = profile.region || acc.region || "";
        acc.avatar =
          existingArtist?.image || profile.avatar || acc.avatar || "";
        acc.bio = profile.bio || acc.bio || "";
        acc.followers += profile.followers || 0;
        acc.followings += profile.followings || 0;
        return acc;
      },
      {
        name: "",
        nickname: "",
        region: "",
        avatar: "",
        bio: "",
        followers: 0,
        followings: 0,
      },
    );

  return { nickname, name, region, avatar, bio, followers, followings };
};

export default getAggregatedSocialProfile;
