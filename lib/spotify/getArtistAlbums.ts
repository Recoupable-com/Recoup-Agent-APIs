const getArtistAlbums = async ({
  id,
  include_groups,
  market,
  limit,
  offset,
  accessToken,
}: {
  id: string;
  include_groups?: string;
  market?: string;
  limit?: string | number;
  offset?: string | number;
  accessToken: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (include_groups) params.append("include_groups", include_groups);
    if (market) params.append("market", market);
    if (limit) params.append("limit", String(limit));
    if (offset) params.append("offset", String(offset));

    const query = params.toString();
    const url = `https://api.spotify.com/v1/artists/${id}/albums${
      query ? `?${query}` : ""
    }`;

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
      error: error instanceof Error ? error : new Error("Unknown error fetching artist albums"),
    };
  }
};

export default getArtistAlbums;
