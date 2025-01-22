const getFormattedProfile = (profile: any) => {
  return {
    avatar: profile.avatar,
    bio: profile.biography,
    followers: profile.followersCount,
    followings: profile.followingCount,
    name: profile.username,
    nickname: profile.name,
    region: profile.location,
  };
};

export default getFormattedProfile;
