import getAggregatedSocials from "./getAggregatedSocials.js";

const getAggregatedProfile = (artist, existingArtist) => {
  const aggregatedArtistProfile = existingArtist
    ? {
        ...artist,
        ...existingArtist,
        image: existingArtist?.image || artist?.image || "",
        artist_social_links: getAggregatedSocials([
          ...(existingArtist?.artist_social_links || []),
          ...artist.artist_social_links,
        ]),
      }
    : artist;

  return aggregatedArtistProfile;
};

export default getAggregatedProfile;
