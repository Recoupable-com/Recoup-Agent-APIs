import { Funnel_Type } from "../lib/funnels.js";
import getSegments from "../lib/getSegments.js";
import getSegmentsWithIcons from "../lib/getSegmentsWithIcons.js";
import uploadPfpToIpfs from "../lib/ipfs/uploadPfpToIpfs.js";
import trackFunnelAnalysisChat from "../lib/stack/trackFunnelAnalysisChat.js";
import { STEP_OF_ANALYSIS } from "../lib/step.js";
import beginAnalysis from "../lib/supabase/beginAnalysis.js";
import saveFunnelArtist from "../lib/supabase/saveFunnelArtist.js";
import saveFunnelComments from "../lib/supabase/saveFunnelComments.js";
import saveFunnelProfile from "../lib/supabase/saveFunnelProfile.js";
import saveFunnelSegments from "../lib/supabase/saveFunnelSegments.js";
import updateAnalysisStatus from "../lib/supabase/updateAnalysisStatus.js";
import getProfile from "../lib/instagram/getProfile.js";
import getProfileDatasetId from "../lib/instagram/getProfileDatasetId.js";
import getPostComments from "../lib/instagram/getPostComments.js";
import getPostCommentsDatasetId from "../lib/instagram/getPostCommentsDatasetId.js";
import createWrappedAnalysis from "./createWrappedAnalysis.js";

const getInstagramAnalysis = async (
  handle,
  chat_id,
  account_id,
  address,
  isWrapped,
  existingArtistId,
) => {
  const newAnalysis = await beginAnalysis(
    chat_id,
    handle,
    Funnel_Type.INSTAGRAM,
  );
  const analysisId = newAnalysis.id;
  try {
    const profileDatasetId = await getProfileDatasetId(handle);
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.PROFILE,
    );
    const accountData = await getProfile(profileDatasetId);
    const profile = accountData?.profile;
    const latestPosts = accountData?.latestPosts;
    const avatar = await uploadPfpToIpfs(profile.avatar);
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.CREATING_ARTIST,
    );
    const newArtist = await saveFunnelArtist(
      Funnel_Type.INSTAGRAM,
      profile?.nickname,
      avatar,
      `https://instagram.com/${profile?.name}`,
      account_id,
    );
    await saveFunnelProfile({
      ...profile,
      avatar,
      type: "INSTAGRAM",
      analysis_id: analysisId,
      artistId: newArtist.id,
    });
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.CREATED_ARTIST,
      0,
      newArtist,
    );
    const commentsDatasetId = await getPostCommentsDatasetId(latestPosts);
    const postComments = await getPostComments(
      commentsDatasetId,
      chat_id,
      analysisId,
    );
    await saveFunnelComments(postComments);
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.SEGMENTS,
    );
    const segments = await getSegments(postComments);
    const segmentsWithIcons = await getSegmentsWithIcons(segments, analysisId);
    await saveFunnelSegments(segmentsWithIcons);
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.SAVING_ANALYSIS,
    );
    if (address) {
      await trackFunnelAnalysisChat(
        address,
        handle,
        newArtist?.id,
        chat_id,
        isWrapped ? "Wrapped" : "Instagram",
      );
    }
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.FINISHED,
    );
    if (isWrapped)
      await createWrappedAnalysis(
        handle,
        chat_id,
        account_id,
        address,
        existingArtistId,
      );
    return;
  } catch (error) {
    console.log(error);
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.INSTAGRAM,
      STEP_OF_ANALYSIS.ERROR,
    );
    throw new Error(error);
  }
};

export default getInstagramAnalysis;
