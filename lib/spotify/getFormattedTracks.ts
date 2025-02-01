const getFormattedTracks = (tracks: any) => {
  return tracks.map((track: any) => ({
    uri: track.uri,
    name: track.name,
    popularity: track.popularity,
  }));
};

export default getFormattedTracks;
