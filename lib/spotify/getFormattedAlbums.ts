const getFormattedAlbums = (albums: any, analysis_id: string) => {
  return albums.map((album: any) => ({
    name: album.name,
    uri: album.uri,
    release_date: album.release_date,
    artist_name: album.artists?.[0]?.name,
    analysis_id,
  }));
};

export default getFormattedAlbums;
