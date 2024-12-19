import getFormattedArtists from "./getFormattedArtists.js";

const getArtists = async (artistId, accessToken) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/related-artists `,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) return { error: true };
    const data = await response.json();
    const artists = data?.artists || [];
    const formattedArtists = getFormattedArtists(artists);
    return formattedArtists;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export default getArtists;
