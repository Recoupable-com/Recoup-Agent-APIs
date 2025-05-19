import getFormattedTracks from "./getFormattedTracks";

export type GetArtistTopTracksParams = {
  id: string;
  market?: string;
  accessToken: string;
};

export const getArtistTopTracks = async ({
  id,
  market,
  accessToken,
}: GetArtistTopTracksParams): Promise<{
  data: any | null;
  error: Error | null;
}> => {
  try {
    const params = new URLSearchParams();
    if (market) params.append("market", market);
    const url =
      params.size > 0
        ? `https://api.spotify.com/v1/artists/${id}/top-tracks?${params}`
        : `https://api.spotify.com/v1/artists/${id}/top-tracks`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return { data: null, error: new Error("Spotify API request failed") };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error fetching top tracks"),
    };
  }
};

const getTopTracks = async (artistId: string, accessToken: string) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await response.json();
    const topTracks = data?.tracks || [];
    const formattedTracks = getFormattedTracks(topTracks);
    return formattedTracks;
  } catch (error) {
    throw new Error(error as string);
  }
};

export default getTopTracks;
