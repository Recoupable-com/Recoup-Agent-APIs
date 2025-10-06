import { Tables } from "../../types/database.types";
import generateAccessToken from "../spotify/generateAccessToken";
import getIsrc from "../spotify/getIsrc";
import { getSpotifyArtists, SpotifyArtist } from "./getSpotifyArtists";

export type SongWithSpotify = Tables<"songs"> & {
  spotifyArtists?: SpotifyArtist[];
};

type SpotifyTrackInfo = {
  name?: string | null;
  album?: string | null;
  artists?: SpotifyArtist[];
};

const getSongsByIsrc = async (
  songs: Tables<"songs">[]
): Promise<SongWithSpotify[]> => {
  if (songs.length === 0) return songs;

  const tokenResult = await generateAccessToken();

  if (!tokenResult.access_token || tokenResult.error) {
    throw tokenResult.error ?? new Error("Failed to generate Spotify token");
  }

  const accessToken = tokenResult.access_token;
  const spotifyTrackByIsrc = new Map<string, SpotifyTrackInfo>();

  await Promise.all(
    songs.map(async (song) => {
      const { track } = await getIsrc({
        isrc: song.isrc,
        accessToken,
      });

      if (track) {
        spotifyTrackByIsrc.set(song.isrc, {
          name: track.name,
          album: track.album?.name,
          artists: getSpotifyArtists(track.artists),
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
      album: track.album ?? song.album,
      spotifyArtists: track.artists,
    };
  });
};

export default getSongsByIsrc;
