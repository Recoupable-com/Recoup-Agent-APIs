import { Scraper } from "agent-twitter-client";
import getAllTweets from "../lib/twitter/getAllTweets.js";
import { STEP_OF_ANALYSIS } from "../lib/step.js";
import beginAnalysis from "../lib/supabase/beginAnalysis.js";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus.js";
import getTwitterComments from "../lib/twitter/getTwitterComments.js";
import saveFunnelComments from "../lib/supabase/saveFunnelComments.js";
import getSegments from "../lib/getSegments.js";
import getSegmentsWithIcons from "../lib/getSegmentsWithIcons.js";
import saveFunnelSegments from "../lib/supabase/saveFunnelSegments.js";
import { Funnel_Type } from "../lib/funnels.js";
import saveFunnelProfile from "../lib/supabase/saveFunnelProfile.js";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat.js";
import saveFunnelArtist from "../lib/supabase/saveFunnelArtist.js";
import getFormattedProfile from "../lib/twitter/getFormattedProfile.js";
import getTiktokProfileDatasetId from "../lib/tiktok/getProfileDatasetId.js";
import getTiktokProfile from "../lib/tiktok/getProfile.js";
import getInstagramProfile from "../lib/instagram/getProfile.js";
import getInstagramProfileDatasetId from "../lib/instagram/getProfileDatasetId.js";
import getAccessToken from "../lib/supabase/getAccessToken.js";
import getSpotifyProfile from "../lib/spotify/getProfile.js";
import getPostComments from "../lib/instagram/getPostComments.js";
import getVideoComments from "../lib/tiktok/getVideoComments.js";
import getAlbums from "../lib/spotify/getAlbums.js";
import getTopTracks from "../lib/spotify/getTopTracks.js";
import saveSpotifyAlbums from "../lib/supabase/saveSpotifyAlbums.js";
import saveSpotifyTracks from "../lib/supabase/saveSpotifyTracks.js";

const scraper = new Scraper();

const getWrappedAnalysis = async (handle, chat_id, account_id, address) => {
  try {
    const newAnalysis = await beginAnalysis(chat_id, handle);
    const analysisId = newAnalysis.id;

    await updateAnalysisStatus(
      chat_id,
      analysisId,
      STEP_OF_ANALYSIS.TWITTER_PROFILE,
    );
    const scrappedProfile = await scraper.getProfile(handle);
    const twitterProfile = getFormattedProfile(scrappedProfile);

    await updateAnalysisStatus(
      chat_id,
      analysisId,
      STEP_OF_ANALYSIS.TIKTOK_PROFILE,
    );
    let profileDatasetId = await getTiktokProfileDatasetId(handle);
    let accountData = await getTiktokProfile(profileDatasetId);
    const tiktokProfile = accountData?.profile?.[0];
    const tiktokAvatar = await uploadPfpToIpfs(profile.avatar);
    const videoUrls = accountData?.videoUrls;

    await updateAnalysisStatus(
      chat_id,
      analysisId,
      STEP_OF_ANALYSIS.INSTAGRAM_PROFILE,
    );
    profileDatasetId = await getInstagramProfileDatasetId(handle);
    accountData = await getInstagramProfile(profileDatasetId);
    const instagramProfile = accountData?.profile;
    const instagramAvatar = await uploadPfpToIpfs(instagramProfile.avatar);
    const latestPosts = accountData?.latestPosts;

    await updateAnalysisStatus(
      chat_id,
      analysisId,
      STEP_OF_ANALYSIS.SPOTIFY_PROFILE,
    );
    const accessToken = await getAccessToken();
    const data = await getSpotifyProfile(handle, accessToken);
    const spotifyProfile = data?.profile;
    const artistUri = data.artistId;

    const postComments = await getPostComments(
      latestPosts,
      chat_id,
      analysisId,
    );

    const videoComments = await getVideoComments(
      videoUrls,
      chat_id,
      analysisId,
    );

    await updateAnalysisStatus(chat_id, analysisId, STEP_OF_ANALYSIS.ALBUMS);
    const albums = await getAlbums(artistUri, accessToken, analysisId);
    await saveSpotifyAlbums(albums);
    await updateAnalysisStatus(chat_id, analysisId, STEP_OF_ANALYSIS.TRACKS);
    const tracks = await getTopTracks(artistUri, accessToken, analysisId);
    await saveSpotifyTracks(tracks);

    await updateAnalysisStatus(
      chat_id,
      analysisId,
      STEP_OF_ANALYSIS.POST_COMMENTS,
      0,
      "twitter",
    );
    const allTweets = await getAllTweets(scraper, handle);
    const twitterComments = getTwitterComments(allTweets, analysisId);

    const comments = [...postComments, ...videoComments, ...twitterComments];
    await saveFunnelComments(comments);

    const segments = await getSegments(comments);
    const segmentsWithIcons = await getSegmentsWithIcons(segments, analysisId);
    await saveFunnelSegments(segmentsWithIcons);
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      STEP_OF_ANALYSIS.CREATING_ARTIST,
    );

    const newArtist = await saveFunnelArtist(
      Funnel_Type.TIKTOK,
      twitterProfile?.nickname ||
        tiktokProfile?.nickname ||
        instagramProfile?.nickname,
      instagramAvatar ||
        tiktokAvatar ||
        spotifyProfile?.avatar ||
        twitterProfile?.avatar,
      {
        twitter_url: `https://x.com/${twitterProfile?.name}`,
        tiktok_url: `https://tiktok.com/@${tiktokProfile?.name}`,
        spotify_url: `https://open.spotify.com/artist/${artistUri}`,
        instagram_url: `https://instagram.com/${instagramProfile?.name}`,
      },
      account_id,
    );

    await saveFunnelProfile({
      profile: {
        ...spotifyProfile,
        ...twitterProfile,
        ...tiktokProfile,
        ...instagramProfile,
      },
      type: "WRAPPED",
      analysis_id: analysisId,
      artistId: newArtist.id,
    });

    await updateAnalysisStatus(
      chat_id,
      analysisId,
      STEP_OF_ANALYSIS.SAVING_ANALYSIS,
    );
    await trackFunnelAnalysisChat(
      address,
      handle,
      newArtist?.id,
      chat_id,
      "Wrapped",
    );
    await updateAnalysisStatus(chat_id, analysisId, STEP_OF_ANALYSIS.FINISHED);
    return;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export default getWrappedAnalysis;
