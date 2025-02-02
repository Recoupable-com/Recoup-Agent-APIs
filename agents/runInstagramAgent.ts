import { STEP_OF_AGENT } from "../lib/step";
import createSocial from "../lib/supabase/createSocial";
import createAgentStatus from "../lib/supabase/createAgentStatus";
import getProfile from "../lib/instagram/getProfile";
import updateAgentStatus from "../lib/supabase/updateAgentStatus";
import setArtistImage from "../lib/supabase/setArtistImage";
import updateSocial from "../lib/supabase/updateSocial";
import connectSocialToArtist from "../lib/supabase/connectSocialToArtist";
import setNewPosts from "../lib/supabase/setNewPosts";
import connectPostsToSocial from "../lib/supabase/connectPostsToSocial";
import getScrapingPosts from "../lib/supabase/getScrapingPosts";
import connectCommentsToSocial from "../lib/supabase/connectCommentsToSocial";
import getPostComments from "../lib/instagram/getPostComments";

const runInstagramAgent = async (
  agent_id: string,
  handle: string,
  artist_id: string,
) => {
  try {
    const { social } = await createSocial({
      username: handle,
      profile_url: `https://instagram.com/${handle}`,
    });
    if (!social?.id) return;
    const { agent_status } = await createAgentStatus(
      agent_id,
      social.id,
      STEP_OF_AGENT.PROFILE,
    );
    if (!agent_status?.id) return;

    const { profile, postUrls } = await getProfile(handle);
    if (!profile) {
      await updateAgentStatus(agent_status.id, STEP_OF_AGENT.UNKNOWN_PROFILE);
      return;
    }

    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.SETTING_UP_ARTIST);
    await setArtistImage(artist_id, profile.avatar);
    await updateSocial(social.id, profile);
    await connectSocialToArtist(artist_id, social);

    if (!postUrls?.length) {
      await updateAgentStatus(agent_status.id, STEP_OF_AGENT.MISSING_POSTS);
      return;
    }

    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.POSTURLS);
    await setNewPosts(postUrls);
    await connectPostsToSocial(social, postUrls);
    const scrapingPosts = await getScrapingPosts(postUrls);

    if (scrapingPosts.length) {
      const comments = await getPostComments(agent_status.id, scrapingPosts);
      await connectCommentsToSocial(comments);
    }

    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.FINISHED);
  } catch (error) {
    console.error(error);
  }
};

export default runInstagramAgent;
