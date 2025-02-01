import { STEP_OF_AGENT } from "./step.js";
import saveFunnelProfile from "./supabase/saveFunnelProfile.js";
import supabase from "./supabase/serverClient.js";
import updateAgentStatus from "./supabase/updateAgentStatus.js";
import updateAnalysisStatus from "./supabase/updateAgentStatus.js";
import updateArtistInfo from "./supabase/updateArtistInfo.js";

const updateArtist = async (
  agent_id: string,
  social_platform: string,
  artistId: string,
  scrapedProfile: any
) => {
  try {
    await updateAgentStatus(
      agent_id,
      social_platform,
      STEP_OF_AGENT.CREATING_ARTIST,
    );
    await updateArtistInfo(artistId, scrapedProfile.avatar)

    const { data: social } = await supabase.from("socials").select("*").eq("profile_url", scrapedProfile.profile_url).single();

    let social_id = social?.id
    if (!social) {
      const { data: new_social  } = await supabase.from("socials").insert(scrapedProfile).select("*").single()
      social_id = new_social.id
    }

    await supabase.from("account_socials").select("*").eq()

    await updateAnalysisStatus(
      pilot_id,
      analysisId,
      funnel_type,
      STEP_OF_ANALYSIS.CREATED_ARTIST,
      0,
      newArtist,
    );

    return newArtist;
  } catch (error) {
    console.error(error);
    throw Error(error as string);
  }
};

export default updateArtist;
