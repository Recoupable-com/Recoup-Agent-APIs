import { Social } from "../../types/agent";
import supabase from "./serverClient";

const connectTracksToSocial = async (social: Social, tracks: any) => {
  try {
    const tracks_uris = tracks.map((track: any) => track.uri);
    const { data: spotify_tracks } = await supabase
      .from("spotify_tracks")
      .select("*")
      .in("uri", tracks_uris);
    if (!spotify_tracks) return [];

    const tracks_ids = spotify_tracks.map((track) => track.id);

    await supabase
      .from("social_spotify_tracks")
      .delete()
      .eq("social_id", social.id)
      .in("track_id", tracks_ids);
    const new_spotify_tracks = spotify_tracks.map((track) => ({
      social_id: social.id,
      track_id: track.id,
    }));
    await supabase.from("social_spotify_tracks").insert(new_spotify_tracks);
    return spotify_tracks;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default connectTracksToSocial;
