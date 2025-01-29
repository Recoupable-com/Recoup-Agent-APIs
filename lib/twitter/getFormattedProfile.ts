const getFormattedProfile = (profile: any) => {
  return {
    avatar: profile.avatar,
    bio: profile.biography,
    followerCount: profile.followersCount,
    followingCount: profile.followingCount,
    username: profile.username,
    name: profile.name,
    region: profile.location,
  };
};

export default getFormattedProfile;
