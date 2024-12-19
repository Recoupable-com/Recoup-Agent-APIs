const getFormattedArtists = (artists) => {
  return artists.map((artist) => ({
    name: artist.name,
    uri: artist.uri,
    popularity: artist.popularity,
  }));
};

export default getFormattedArtists;
