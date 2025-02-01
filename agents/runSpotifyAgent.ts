import { STEP_OF_ANALYSIS } from "../lib/step";
import beginAnalysis from "../lib/supabase/initialize";
import updateAnalysisStatus from "../lib/supabase/updateAgentStatus";
import getSegments from "../lib/getSegments";
import getSegmentsWithIcons from "../lib/getSegmentsWithIcons";
import saveFunnelSegments from "../lib/supabase/saveFunnelSegments";
import { Funnel_Type } from "../lib/funnels";
import saveFunnelProfile from "../lib/supabase/saveFunnelProfile";
import saveFunnelArtist from "../lib/supabase/saveFunnelArtist";
import { getProfile } from "../lib/spotify/getProfile";
import getAccessToken from "../lib/supabase/getAccessToken";
import getAlbums from "../lib/spotify/getAlbums";
import getTopTracks from "../lib/spotify/getTopTracks";
import saveSpotifyAlbums from "../lib/supabase/saveSpotifyAlbums";
import saveSpotifyTracks from "../lib/supabase/saveSpotifyTracks";
import getArtist from "../lib/supabase/getArtist";

const runSpotifyAgent = async (
  handle: string,
  pilot_id: string,
  account_id: string | null,
  existingArtistId: string | null = null,
) => {
  const newAnalysis = await beginAnalysis(
    pilot_id,
    handle,
    Funnel_Type.SPOTIFY,
    existingArtistId,
  );
  const analysisId = newAnalysis.id;
  try {
    const existingArtist = await getArtist(existingArtistId);
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.SPOTIFY,
      STEP_OF_ANALYSIS.PROFILE,
    );
    const accessToken = await getAccessToken();
    const data = await getProfile(handle, accessToken);
    const profile = data.profile;
    const artistUri = data.artistId;
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.SPOTIFY,
      STEP_OF_ANALYSIS.CREATING_ARTIST,
    );
    const newArtist = await saveFunnelArtist(
      Funnel_Type.SPOTIFY,
      existingArtist?.name || profile?.name,
      existingArtist?.image || profile?.avatar,
      `https://open.spotify.com/artist/${artistUri}`,
      account_id,
      existingArtistId,
    );

    await saveFunnelProfile({
      ...profile,
      type: "SPOTIFY",
      analysis_id: analysisId,
      artistId: newArtist.id,
    });
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.SPOTIFY,
      STEP_OF_ANALYSIS.CREATED_ARTIST,
      0,
      newArtist,
    );
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.SPOTIFY,
      STEP_OF_ANALYSIS.ALBUMS,
    );
    const albums = await getAlbums(artistUri, accessToken, analysisId);
    await saveSpotifyAlbums(albums);
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.SPOTIFY,
      STEP_OF_ANALYSIS.TRACKS,
    );
    const tracks = await getTopTracks(artistUri, accessToken, analysisId);
    await saveSpotifyTracks(tracks);
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.SPOTIFY,
      STEP_OF_ANALYSIS.SEGMENTS,
    );
    const segments = await getSegments([...tracks, ...albums]);
    const segmentsWithIcons = await getSegmentsWithIcons(segments, analysisId);
    await saveFunnelSegments(segmentsWithIcons);
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.SPOTIFY,
      STEP_OF_ANALYSIS.SAVING_ANALYSIS,
    );
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.SPOTIFY,
      STEP_OF_ANALYSIS.FINISHED,
    );
    return;
  } catch (error) {
    console.error(error);
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.SPOTIFY,
      STEP_OF_ANALYSIS.ERROR,
    );
  }
};

export default runSpotifyAgent;
