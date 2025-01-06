import searchArtist from "./searchArtist.js";

const getProfile = async (handle, accessToken) => {
  const artist = await searchArtist(handle, accessToken);
  if (artist?.error) throw new Error(artist?.error);
  return {
    profile: {
      name: artist.name,
      nickname: artist.name,
      avatar: artist.images?.[0]?.url || "",
      followers: artist.followers.total,
      bio: "",
      followings: 0,
      region: "",
    },
    artistId: artist.id,
  };
};

export default getProfile;
