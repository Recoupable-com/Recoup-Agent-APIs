import { STEP_OF_AGENT } from "../lib/step";
import updateAnalysisStatus from "../lib/supabase/updateAgentStatus";
import getAccessToken from "../lib/supabase/getAccessToken";
import getAlbums from "../lib/spotify/getAlbums";
import getTopTracks from "../lib/spotify/getTopTracks";
import updateAgentStatus from "../lib/supabase/updateAgentStatus";
import getArtist from "../lib/spotify/getArtist";
import searchArtist from "../lib/spotify/searchArtist";
import createSocial from "../lib/supabase/createSocial";
import getProfile from "../lib/spotify/getProfile";
import createAgentStatus from "../lib/supabase/createAgentStatus";
import setArtistImage from "../lib/supabase/setArtistImage";
import updateSocial from "../lib/supabase/updateSocial";
import connectSocialToArtist from "../lib/supabase/connectSocialToArtist";
import setNewAlbums from "../lib/supabase/setNewAlbums";
import connectAlbumsToSocial from "../lib/supabase/connectAlbumsToSocial";
import setNewTracks from "../lib/supabase/setNewTracks";
import connectTracksToSocial from "../lib/supabase/connectTracksToSocial";

const runSpotifyAgent = async (
  agent_id: string,
  handle: string,
  artist_id: string,
) => {
  try {
    const accessToken = await getAccessToken();
    const { artist: searchedArtist } = await searchArtist(handle, accessToken);
    let artistdata = null;
    let profile_url = null;
    if (!searchedArtist) {
      const { artist } = await getArtist(handle, accessToken);
      if (artist) artistdata = getProfile(artist);
    } else artistdata = getProfile(searchedArtist);

    const { social } = await createSocial({
      username: handle,
      profile_url: profile_url || `https://open.spotify.com/artist/${handle}`,
    });

    if (!social?.id) return;

    const { agent_status } = await createAgentStatus(
      agent_id,
      social.id,
      STEP_OF_AGENT.PROFILE,
    );
    if (!agent_status?.id) return;

    if (!artistdata?.profile) {
      await updateAgentStatus(agent_status.id, STEP_OF_AGENT.UNKNOWN_PROFILE);
      return;
    }

    const profile = artistdata.profile;
    const artistUri = artistdata.artistId;

    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.SETTING_UP_ARTIST);
    await setArtistImage(artist_id, profile.avatar);
    await updateSocial(social.id, profile);
    await connectSocialToArtist(artist_id, social);

    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.ALBUMS);
    const albums = await getAlbums(artistUri, accessToken);
    await setNewAlbums(albums);
    await connectAlbumsToSocial(social, albums);

    await updateAnalysisStatus(agent_status.id, STEP_OF_AGENT.TRACKS);
    const tracks = await getTopTracks(artistUri, accessToken);
    await setNewTracks(tracks);
    await connectTracksToSocial(social, tracks);

    await updateAnalysisStatus(agent_status.id, STEP_OF_AGENT.FINISHED);
    return;
  } catch (error) {
    console.error(error);
  }
};

export default runSpotifyAgent;
