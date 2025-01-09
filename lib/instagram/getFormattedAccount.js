const getFormattedAccount = (data) => {
  return {
    profile: {
      nickname: data?.[0]?.fullName,
      name: data?.[0]?.username,
      bio: data?.[0]?.biography,
      followers: data?.[0]?.followersCount,
      followings: data?.[0]?.followersCount,
      avatar: data?.[0]?.profilePicUrl,
    },
    latestPosts: data?.[0]?.latestPosts?.map((post) => post.url) || [],
  };
};

export default getFormattedAccount;
