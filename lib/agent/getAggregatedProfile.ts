import getAggregatedSocials from "./getAggregatedSocials";

const getAggregatedProfile = (artist: any, existingArtist: any) => {
  const aggregatedArtistProfile = existingArtist
    ? {
        ...artist,
        ...existingArtist,
        image: existingArtist?.image || artist?.image || "",
        account_socials: getAggregatedSocials([
          ...(existingArtist?.account_socials || []),
          ...artist.account_socials,
        ]),
      }
    : artist;

  return aggregatedArtistProfile;
};

export default getAggregatedProfile;
