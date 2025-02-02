const getArtist = async (id: string, accessToken: string) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok)
      return { error: new Error("Spotify api request failed"), artist: null };
    const data = await response.json();

    return { error: null, artist: data };
  } catch (error) {
    console.error(error);
    return {
      artist: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error scraping profile"),
    };
  }
};

export default getArtist;
