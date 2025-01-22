import supabase from "./serverClient";

const saveSpotifyTracks = async (tracks: any) => {
  const { data } = await supabase
    .from("spotify_analytics_tracks")
    .insert(tracks)
    .select("*");

  return data;
};

export default saveSpotifyTracks;
