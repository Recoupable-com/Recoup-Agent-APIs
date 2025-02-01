const getFormattedAlbums = (albums: any) => {
  return albums.map((album: any) => ({
    name: album.name,
    uri: album.uri,
    release_date: album.release_date,
  }));
};

export default getFormattedAlbums;
