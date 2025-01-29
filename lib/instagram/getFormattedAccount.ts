const getFormattedAccount = (data: any) => {
  if (data.length === 0 || data?.error) return null;
  return {
    profile: {
      name: data?.[0]?.fullName || "",
      username: data?.[0]?.username || "",
      bio: data?.[0]?.biography || "",
      followerCount: data?.[0]?.followersCount || 0,
      followingCount: data?.[0]?.followingsCount || 0,
      avatar: data?.[0]?.profilePicUrl || "",
    },
    latestPosts: data?.[0]?.latestPosts?.map((post: any) => post.url) || [],
  };
};

export default getFormattedAccount;
