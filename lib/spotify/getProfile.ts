const getProfile = (artist: any) => {
  return {
    profile: {
      username: artist.name,
      avatar: artist.images?.[0]?.url || "",
      followerCount: artist.followers.total,
      bio: "",
      followingCount: 0,
      region: "",
      profile_url: `https://open.spotify.com/artist/${artist.id}`,
    },
    artistId: artist.id,
  };
};

export default getProfile;
