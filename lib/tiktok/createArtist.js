import { Funnel_Type } from "../funnels.js";
import uploadPfpToIpfs from "../ipfs/uploadPfpToIpfs.js";
import { STEP_OF_ANALYSIS } from "../step";
import getArtist from "../supabase/getArtist.js";
import saveFunnelArtist from "../supabase/saveFunnelArtist";
import saveFunnelProfile from "../supabase/saveFunnelProfile.js";
import updateAnalysisStatus from "../supabase/updateAnalysisStatus";

const createArtist = async (
  chat_id,
  analysisId,
  account_id,
  existingArtistId,
  profile,
) => {
  try {
    const existingArtist = await getArtist(existingArtistId);
    const avatar = await uploadPfpToIpfs(profile.avatar);
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.TIKTOK,
      STEP_OF_ANALYSIS.CREATING_ARTIST,
    );
    const newArtist = await saveFunnelArtist(
      Funnel_Type.TIKTOK,
      existingArtist?.name || profile?.nickname,
      existingArtist?.image || avatar,
      existingArtist?.instruction || "",
      existingArtist?.label || "",
      existingArtist?.knowledges || [],
      `https://tiktok.com/@${profile?.name}`,
      account_id,
      existingArtistId,
    );

    await saveFunnelProfile({
      ...profile,
      avatar,
      type: "TIKTOK",
      analysis_id: analysisId,
      artistId: newArtist.id,
    });
    await updateAnalysisStatus(
      chat_id,
      analysisId,
      Funnel_Type.TIKTOK,
      STEP_OF_ANALYSIS.CREATED_ARTIST,
      0,
      newArtist,
    );
  } catch (error) {
    console.error(error);
    throw Error(error);
  }
};

export default createArtist;
