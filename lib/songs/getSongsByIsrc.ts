import { Tables } from "../../types/database.types";
import generateAccessToken from "../spotify/generateAccessToken";
import getIsrc from "../spotify/getIsrc";

const getSongsByIsrc = async (
  songs: Tables<"songs">[]
): Promise<Tables<"songs">[]> => {
  if (songs.length === 0) return songs;

  const tokenResult = await generateAccessToken();

  if (!tokenResult.access_token || tokenResult.error) {
    throw tokenResult.error ?? new Error("Failed to generate Spotify token");
  }

  const accessToken = tokenResult.access_token;
  const spotifyTrackByIsrc = new Map<
    string,
    { name?: string | null; album?: { name?: string | null } | null }
  >();

  await Promise.all(
    songs.map(async (song) => {
      const { track } = await getIsrc({
        isrc: song.isrc,
        accessToken,
      });

      if (track) {
        spotifyTrackByIsrc.set(song.isrc, {
          name: track.name,
          album: track.album,
        });
      }
    })
  );

  return songs.map((song) => {
    const track = spotifyTrackByIsrc.get(song.isrc);

    if (!track) {
      return song;
    }

    return {
      ...song,
      name: track.name ?? song.name,
      album: track.album?.name ?? song.album,
    };
  });
};

export default getSongsByIsrc;
