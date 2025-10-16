import getSearch from "./getSearch";
import { SpotifyTrack } from "../../types/spotify.types";

type GetIsrcParams = {
  isrc: string;
  accessToken: string;
  market?: string;
};

const getIsrc = async ({
  isrc,
  accessToken,
  market,
}: GetIsrcParams): Promise<{
  track: SpotifyTrack | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await getSearch({
      q: `isrc:${isrc}`,
      type: "track",
      limit: 1,
      accessToken,
      market,
    });

    if (error) {
      return { track: null, error };
    }

    const track = data?.tracks?.items?.[0] ?? null;
    return { track, error: null };
  } catch (unknownError) {
    return {
      track: null,
      error:
        unknownError instanceof Error
          ? unknownError
          : new Error("Unknown error fetching Spotify track by ISRC"),
    };
  }
};

export default getIsrc;
