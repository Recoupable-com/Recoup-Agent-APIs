const getFormattedAccount = (data) => {
  if (data.length === 0 || data?.error) return null;
  console.log("ZIAD formatted data", data)
  return {
    profile: {
      nickname: data?.[0]?.fullName || "",
      name: data?.[0]?.username || "",
      bio: data?.[0]?.biography || "",
      followers: data?.[0]?.followersCount || 0,
      followings: data?.[0]?.followersCount || 0,
      avatar: data?.[0]?.profilePicUrl || "",
    },
    latestPosts: data?.[0]?.latestPosts?.map((post) => post.url) || [],
  };
};

export default getFormattedAccount;
