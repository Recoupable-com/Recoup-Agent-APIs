import searchArtist from "./searchArtist";

export const getProfile = async (handle: string, accessToken: string) => {
  const artist = await searchArtist(handle, accessToken);
  if (artist?.error) throw new Error(artist?.error);
  return {
    profile: {
      name: artist.name,
      username: artist.name,
      avatar: artist.images?.[0]?.url || "",
      followerCount: artist.followers.total,
      bio: "",
      followingCount: 0,
      region: "",
    },
    artistId: artist.id,
  };
};
