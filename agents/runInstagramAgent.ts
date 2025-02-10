import { STEP_OF_AGENT } from "../lib/step";
import createSocial from "../lib/supabase/createSocial";
import createAgentStatus from "../lib/supabase/createAgentStatus";
import getProfile from "../lib/instagram/getProfile";
import updateAgentStatus from "../lib/supabase/updateAgentStatus";
import setNewPosts from "../lib/supabase/setNewPosts";
import connectPostsToSocial from "../lib/supabase/connectPostsToSocial";
import getScrapingPosts from "../lib/supabase/getScrapingPosts";
import connectCommentsToSocial from "../lib/supabase/connectCommentsToSocial";
import getPostComments from "../lib/instagram/getPostComments";
import uploadPfpToArweave from "../lib/arweave/uploadPfpToArweave";

const runInstagramAgent = async (
  agent_id: string,
  handle: string,
): Promise<{
  social_id: string | null;
  error: Error | null;
}> => {
  try {
    // Phase 1: Get Profile Data
    const { profile, postUrls } = await getProfile(handle);
    if (!profile) {
      console.error(`Profile not found for handle: ${handle}`);
      return { social_id: null, error: new Error("Profile not found") };
    }

    // Phase 2: Upload Avatar
    const avatarUrl = await uploadPfpToArweave(profile.avatar);
    if (!avatarUrl) {
      console.log(`Avatar upload to Arweave failed for ${handle}, will try IPFS fallback`);
    }

    // Phase 3: Create Social Record
    const { social, error: socialError } = await createSocial({
      username: handle,
      profile_url: `https://instagram.com/${handle}`,
      avatar: avatarUrl || profile.avatar,
      bio: profile.bio,
      followerCount: profile.followerCount,
      followingCount: profile.followingCount,
    });
    if (!social?.id || socialError) {
      console.error(`Failed to create social record for ${handle}:`, socialError);
      return { social_id: null, error: socialError || new Error("Failed to create social record") };
    }

    // Phase 4: Create Agent Status
    const { agent_status, error: statusError } = await createAgentStatus(
      agent_id,
      social.id,
      STEP_OF_AGENT.PROFILE,
    );
    if (!agent_status?.id || statusError) {
      console.error(`Failed to create agent status for ${handle}:`, statusError);
      return { social_id: social.id, error: statusError || new Error("Failed to create agent status") };
    }

    // Phase 5: Handle Posts
    if (!postUrls?.length) {
      await updateAgentStatus(agent_status.id, STEP_OF_AGENT.MISSING_POSTS);
      return { social_id: social.id, error: null };
    }

    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.POSTURLS);
    await setNewPosts(postUrls);
    await connectPostsToSocial(social, postUrls);

    // Phase 6: Handle Comments
    const scrapingPosts = await getScrapingPosts(postUrls);
    if (scrapingPosts.length) {
      const comments = await getPostComments(agent_status.id, scrapingPosts);
      await connectCommentsToSocial(comments);
    }

    // Phase 7: Complete
    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.FINISHED);
    return { social_id: social.id, error: null };
  } catch (error) {
    console.error(`Error in runInstagramAgent for ${handle}:`, error);
    return { 
      social_id: null, 
      error: error instanceof Error ? error : new Error("Unknown error in runInstagramAgent") 
    };
  }
};

export default runInstagramAgent;
