type GetSearchParams = {
  q: string;
  type: string;
  market?: string;
  limit?: string | number;
  offset?: string | number;
  accessToken: string;
};

const getSearch = async ({
  q,
  type,
  market,
  limit,
  offset,
  accessToken,
}: GetSearchParams) => {
  try {
    const params = new URLSearchParams({ q, type });
    if (market) params.append("market", String(market));
    if (limit) params.append("limit", String(limit));
    if (offset) params.append("offset", String(offset));

    const url = `https://api.spotify.com/v1/search?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return { error: new Error("Spotify API request failed"), data: null };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error searching Spotify"),
    };
  }
};

export default getSearch;
