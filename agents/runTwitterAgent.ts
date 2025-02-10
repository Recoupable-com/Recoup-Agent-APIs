import { Scraper } from "agent-twitter-client";
import { STEP_OF_AGENT } from "../lib/step";
import createSocial from "../lib/supabase/createSocial";
import createAgentStatus from "../lib/supabase/createAgentStatus";
import getProfile from "../lib/twitter/getProfile";
import updateAgentStatus from "../lib/supabase/updateAgentStatus";
import setArtistImage from "../lib/supabase/setArtistImage";
import updateSocial from "../lib/supabase/updateSocial";
import connectSocialToArtist from "../lib/supabase/connectSocialToArtist";
import getAllTweets from "../lib/twitter/getAllTweets";
import setNewPosts from "../lib/supabase/setNewPosts";
import connectPostsToSocial from "../lib/supabase/connectPostsToSocial";
import connectCommentsToSocial from "../lib/supabase/connectCommentsToSocial";
import getTwitterCommentsPosts from "../lib/twitter/getTwitterCommentsPosts";

const scraper = new Scraper();

const runTwitterAgent = async (
  agent_id: string,
  handle: string,
  artist_id: string = "",
) => {
  try {
    const { social } = await createSocial({
      username: handle,
      profile_url: `https://x.com/${handle}`,
    });
    if (!social?.id) return;

    const { agent_status } = await createAgentStatus(
      agent_id,
      social.id,
      STEP_OF_AGENT.PROFILE,
    );
    if (!agent_status?.id) return;

    const { profile } = await getProfile(scraper, handle);
    if (!profile) {
      await updateAgentStatus(agent_status.id, STEP_OF_AGENT.UNKNOWN_PROFILE);
      return;
    }

    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.SETTING_UP_ARTIST);
    await setArtistImage(artist_id, profile.avatar);
    await updateSocial(social.id, profile);
    await connectSocialToArtist(artist_id, social);

    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.POSTURLS);
    const allTweets = await getAllTweets(scraper, handle);
    const { comments, postUrls } = getTwitterCommentsPosts(allTweets);

    if (!postUrls?.length) {
      await updateAgentStatus(agent_status.id, STEP_OF_AGENT.MISSING_POSTS);
      return;
    }

    if (!comments?.length) {
      await updateAgentStatus(agent_status.id, STEP_OF_AGENT.ERROR);
      return;
    }

    await setNewPosts(postUrls);
    const posts = await connectPostsToSocial(social, postUrls);

    const commentsWithPostId = comments
      .map((comment: any) => {
        const post = posts.find((ele) => ele.post_url === comment.post_url);
        if (post)
          return {
            comment: comment.comment,
            username: comment.username,
            commented_at: comment.commented_at,
            post_id: post.id,
            profile_url: comment.profile_url,
          };
        return null;
      })
      .filter((ele: any) => ele !== null);

    await connectCommentsToSocial(commentsWithPostId);
    await updateAgentStatus(agent_status.id, STEP_OF_AGENT.FINISHED);
    return;
  } catch (error) {
    console.error(error);
  }
};

export default runTwitterAgent;
