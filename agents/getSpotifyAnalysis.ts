import { STEP_OF_ANALYSIS } from "../lib/step";
import beginAnalysis from "../lib/supabase/beginAnalysis";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus";
import getSegments from "../lib/getSegments";
import getSegmentsWithIcons from "../lib/getSegmentsWithIcons";
import saveFunnelSegments from "../lib/supabase/saveFunnelSegments";
import { Funnel_Type } from "../lib/funnels";
import saveFunnelProfile from "../lib/supabase/saveFunnelProfile";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat";
import saveFunnelArtist from "../lib/supabase/saveFunnelArtist";
import { getProfile } from "../lib/spotify/getProfile";
import getAccessToken from "../lib/supabase/getAccessToken";
import getAlbums from "../lib/spotify/getAlbums";
import getTopTracks from "../lib/spotify/getTopTracks";
import saveSpotifyAlbums from "../lib/supabase/saveSpotifyAlbums";
import saveSpotifyTracks from "../lib/supabase/saveSpotifyTracks";
import createWrappedAnalysis from "./createWrappedAnalysis";
import getArtist from "../lib/supabase/getArtist";

const getSpotifyAnalysis = async (
  handle: string,
  pilot_id: string,
  account_id: string | null,
  address: string | null,
  isWrapped: boolean,
  existingArtistId: string | null = null,
) => {
  const newAnalysis = await beginAnalysis(
    pilot_id,
    handle,
    Funnel_Type.SPOTIFY,
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
    await trackFunnelAnalysisChat(
      address,
      handle,
      newArtist?.id,
      pilot_id,
      isWrapped ? "Wrapped" : "Spotify",
    );
    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      Funnel_Type.SPOTIFY,
      STEP_OF_ANALYSIS.FINISHED,
    );
    if (isWrapped)
      await createWrappedAnalysis(
        handle,
        pilot_id,
        account_id,
        address,
        existingArtistId,
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

export default getSpotifyAnalysis;
