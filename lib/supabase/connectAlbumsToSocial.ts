import { Post, Social } from "../../types/agent";
import supabase from "./serverClient";

const connectAlbumsToSocial = async (social: Social, albums: any) => {
  try {
    const albums_uris = albums.map((album: any) => album.uri);
    const { data: spotify_albums } = await supabase
      .from("spotify_albums")
      .select("*")
      .in("uri", albums_uris);
    if (!spotify_albums) return [];

    const album_ids = spotify_albums.map((album) => album.id);

    await supabase
      .from("social_spotify_albums")
      .delete()
      .eq("social_id", social.id)
      .in("album_id", album_ids);
    const new_spotify_albums = spotify_albums.map((album) => ({
      social_id: social.id,
      album_id: album.id,
    }));
    await supabase.from("social_spotify_albums").insert(new_spotify_albums);
    return spotify_albums;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default connectAlbumsToSocial;
