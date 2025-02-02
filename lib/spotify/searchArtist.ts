import { UNKNOWN_PROFILE_ERROR } from "../twitter/errors";

const searchArtist = async (handle: string, accessToken: string) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(`artist:${handle}`)}&type=artist`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok)
      return { error: new Error("Spotify api request failed"), artist: null };

    const data = await response.json();

    if (data.artists.items.length === 0)
      return { error: UNKNOWN_PROFILE_ERROR, artist: null };
    return { artist: data.artists.items?.[0], error: null };
  } catch (error) {
    console.error(error);
    return {
      artist: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error searching profile"),
    };
  }
};

export default searchArtist;
