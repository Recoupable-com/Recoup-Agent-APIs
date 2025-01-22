import getFormattedAlbums from "./getFormattedAlbums";

const getAlbums = async (
  artistId: string,
  accessToken: string,
  analysisId: string,
) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums`,
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
    const formattedSavedAlbums = getFormattedAlbums(
      data?.items || [],
      analysisId,
    );
    return formattedSavedAlbums;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export default getAlbums;
