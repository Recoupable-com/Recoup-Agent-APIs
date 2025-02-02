import supabase from "./serverClient";

const setNewTracks = async (tracks: Array<string>) => {
  try {
    const uris = tracks.map((track: any) => track.uri);
    const { data: existing_tracks } = await supabase
      .from("spotify_tracks")
      .select("*")
      .in("uri", uris);
    const missing_tracks = tracks.filter(
      (track: any) =>
        !existing_tracks?.some(
          (existing_track) => existing_track.uri === track.uri,
        ),
    );
    const { data: new_tracks } = await supabase
      .from("spotify_tracks")
      .insert(missing_tracks)
      .select("*");
    return new_tracks;
  } catch (error) {
    console.error(error);
    return;
  }
};

export default setNewTracks;
