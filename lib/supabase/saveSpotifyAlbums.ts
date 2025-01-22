import supabase from "./serverClient";

const saveSpotifyAlbums = async (albums: any) => {
  const { data } = await supabase
    .from("spotify_analytics_albums")
    .insert(albums)
    .select("*");

  return data;
};

export default saveSpotifyAlbums;
