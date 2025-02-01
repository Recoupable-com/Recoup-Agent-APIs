import supabase from "./serverClient";

const setNewAlbums = async (albums: Array<string>) => {
  try {
    const uris = albums.map((album: any) => album.uri);
    const { data: existing_albums } = await supabase
      .from("spotify_albums")
      .select("*")
      .in("uri", uris);
    const missing_albums = albums.filter(
      (album: any) =>
        !existing_albums?.some(
          (existing_album) => existing_album.uri === album.uri,
        ),
    );
    const { data: new_albums } = await supabase
      .from("spotify_albums")
      .insert(missing_albums)
      .select("*");
    console.log("ZIAD", new_albums);
    return;
  } catch (error) {
    console.error(error);
    return;
  }
};

export default setNewAlbums;
