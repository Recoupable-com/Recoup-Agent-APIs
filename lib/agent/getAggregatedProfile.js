import getAggregatedSocials from "./getAggregatedSocials.js";

const getAggregatedProfile = (artist, existingArtist) => {
  const aggregatedArtistProfile = existingArtist
    ? {
        ...artist,
        ...existingArtist,
        artist_social_links: getAggregatedSocials([
          ...(existingArtist.artist_social_links || []),
          ...artist.artist_social_links,
        ]),
        isWrapped: true,
      }
    : artist;

  return aggregatedArtistProfile;
};

export default getAggregatedProfile;
