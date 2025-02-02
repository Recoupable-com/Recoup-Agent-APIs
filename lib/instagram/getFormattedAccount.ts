const getFormattedAccount = (data: any) => {
  if (data.length === 0 || data?.error || !data?.[0]?.username)
    return {
      profile: null,
      postUrls: null,
    };

  return {
    profile: {
      username: data[0].username || "",
      bio: data[0]?.biography || "",
      followerCount: data[0]?.followersCount || 0,
      followingCount: data[0]?.followingsCount || 0,
      avatar: data[0]?.profilePicUrl || "",
      profile_url: `https://instagram.com/${data[0].username}`,
      region: "",
    },
    postUrls: data?.[0]?.latestPosts?.map((post: any) => post.url) || [],
  };
};

export default getFormattedAccount;
