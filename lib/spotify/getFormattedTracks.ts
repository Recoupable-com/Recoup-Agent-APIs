const getFormattedTracks = (tracks: any, analysis_id: string) => {
  return tracks.map((track: any) => ({
    uri: track.uri,
    name: track.name,
    popularity: track.popularity,
    artist_name: track.artists?.[0]?.name || track.album.artists?.[0]?.name,
    analysis_id,
  }));
};

export default getFormattedTracks;
