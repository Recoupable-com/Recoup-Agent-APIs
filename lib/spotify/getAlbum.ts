const getAlbum = async ({ id, market, accessToken }: { id: string; market?: string; accessToken: string; }) => {
  try {
    const params = new URLSearchParams();
    if (market) params.append("market", market);
    const url = `https://api.spotify.com/v1/albums/${id}${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return { error: new Error("Spotify API request failed"), album: null };
    }

    const data = await response.json();
    return { album: data, error: null };
  } catch (error) {
    console.error(error);
    return {
      album: null,
      error: error instanceof Error ? error : new Error("Unknown error fetching album"),
    };
  }
};

export default getAlbum;
