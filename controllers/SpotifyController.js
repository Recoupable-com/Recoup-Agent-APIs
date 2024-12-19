import getAlbums from "../lib/spotify/getAlbums.js";
import getArtists from "../lib/spotify/getArtists.js";
import getTopTracks from "../lib/spotify/getTopTracks.js";
import searchArtist from "../lib/spotify/searchArtist.js";
import getAccessToken from "../lib/supabase/getAccessToken.js";

export const getProfile = async (req, res) => {
  const { handle } = req.query;
  const accessToken = await getAccessToken();
  const artist = await searchArtist(handle, accessToken);
  if (artist?.error) return res.status(500).json({ error: artist?.error });
  try {
    return res.status(200).json({
      profile: {
        name: artist.name,
        image: artist.images?.[0]?.url || "",
        fans: artist.followers.total,
        id: artist.id,
        external_urls: artist.external_urls,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const getArtistAlbums = async (req, res) => {
  const { artistId } = req.query;
  const accessToken = await getAccessToken();
  const albums = await getAlbums(artistId, accessToken);
  if (albums?.error) return res.status(500).json({ error: albums?.error });
  try {
    return res.status(200).json({ albums });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const getArtistTracks = async (req, res) => {
  const { artistId } = req.query;
  const accessToken = await getAccessToken();
  const tracks = await getTopTracks(artistId, accessToken);
  if (tracks?.error) return res.status(500).json({ error: tracks?.error });
  try {
    return res.status(200).json({ tracks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const getRelatedArtists = async (req, res) => {
  const { artistId } = req.query;
  const accessToken = await getAccessToken();
  const artists = await getArtists(artistId, accessToken);
  if (artists?.error) return res.status(500).json({ error: artists?.error });
  try {
    return res.status(200).json({ artists });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};
