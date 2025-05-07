import { UNKNOWN_PROFILE_ERROR } from "../twitter/errors";
import getSearch from "./getSearch";

const searchArtist = async (handle: string, accessToken: string) => {
  try {
    const { data, error } = await getSearch({
      q: `artist:${handle}`,
      type: "artist",
      accessToken,
    });

    if (error)
      return { error: new Error("Spotify api request failed"), artist: null };

    if (!data?.artists?.items?.length)
      return { error: UNKNOWN_PROFILE_ERROR, artist: null };

    return { artist: data.artists.items[0], error: null };
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
