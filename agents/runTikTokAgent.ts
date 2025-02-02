import updateAgentStatus from "../lib/supabase/updateAgentStatus";
import createSocial from "../lib/supabase/createSocial";
import createAgentStatus from "../lib/supabase/createAgentStatus";
import { STEP_OF_AGENT } from "../lib/step";
import getProfile from "../lib/tiktok/getProfile";
import setArtistImage from "../lib/supabase/setArtistImage";
import updateSocial from "../lib/supabase/updateSocial";
import connectSocialToArtist from "../lib/supabase/connectSocialToArtist";
import setNewPosts from "../lib/supabase/setNewPosts";
import getScrapingPosts from "../lib/supabase/getScrapingPosts";
import connectPostsToSocial from "../lib/supabase/connectPostsToSocial";
import getVideoComments from "../lib/tiktok/getVideoComments";
import connectCommentsToSocial from "../lib/supabase/connectCommentsToSocial";

const runTikTokAgent = async (
  agent_id: string,
  handle: string,
  artist_id: string,
) => {
  try {
    const { social } = await createSocial({
      username: handle,
      profile_url: `https://tiktok.com/@${handle}`,
    });
    if (!social?.id) return;
    const { agent_status } = await createAgentStatus(
      agent_id,
      social.id,
      STEP_OF_AGENT.PROFILE,
    );
    if (!agent_status?.id) return;

    const { profile, videoUrls } = await getProfile(handle);
    if (!profile) {
      await updateAgentStatus(agent_status.id, STEP_OF_AGENT.UNKNOWN_PROFILE);
      return;
    }

    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.SETTING_UP_ARTIST);
    await setArtistImage(artist_id, profile.avatar);
    await updateSocial(social.id, profile);
    await connectSocialToArtist(artist_id, social);

    if (!videoUrls?.length) {
      await updateAgentStatus(agent_status.id, STEP_OF_AGENT.MISSING_POSTS);
      return;
    }

    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.POSTURLS);
    await setNewPosts(videoUrls);
    await connectPostsToSocial(social, videoUrls);
    const scrapingPosts = await getScrapingPosts(videoUrls);

    if (scrapingPosts.length) {
      const comments = await getVideoComments(agent_status.id, scrapingPosts);
      await connectCommentsToSocial(comments);
    }

    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.FINISHED);
    return;
  } catch (error) {
    console.error(error);
  }
};

export default runTikTokAgent;
