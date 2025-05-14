import { Database } from "../../types/database.types";
import createSocials from "../supabase/createSocials";
import deleteSocialPosts from "../supabase/deleteSocialPosts";
import insertSocialPosts from "../supabase/insertSocialPosts";

type DbPost = Database["public"]["Tables"]["posts"]["Row"];

const connectTweetsToSocial = async (
  posts: DbPost[],
  tweets: Array<{ username: string; url: string }>
): Promise<void> => {
  try {
    // Group tweets by username
    const tweetsByUsername = tweets.reduce(
      (acc, tweet) => {
        if (!acc[tweet.username]) {
          acc[tweet.username] = [];
        }
        acc[tweet.username].push(tweet);
        return acc;
      },
      {} as Record<string, Array<{ username: string; url: string }>>
    );

    // Create social records for all usernames at once
    const { socialMap, error: socialError } = await createSocials(
      Object.keys(tweetsByUsername).map((username) => ({
        username,
        profile_url: `https://twitter.com/${username}`,
      }))
    );

    if (socialError) {
      console.error("Failed to create social records:", socialError);
      return;
    }

    // Process each username's posts
    for (const [username, userTweets] of Object.entries(tweetsByUsername)) {
      const socialId = socialMap[username];
      if (!socialId) continue;

      // Get post IDs for this user's tweets
      const postIds = posts
        .filter((post) =>
          userTweets.some((tweet) => tweet.url === post.post_url)
        )
        .map((post) => post.id);

      if (postIds.length === 0) continue;

      // Delete existing connections
      await deleteSocialPosts(socialId, postIds);

      // Create new connections
      const socialPosts = postIds.map((postId) => ({
        social_id: socialId,
        post_id: postId,
        updated_at: new Date().toISOString(),
      }));

      await insertSocialPosts(socialPosts);
    }
  } catch (error) {
    console.error("Error in connectTweetsToSocial:", error);
  }
};

export default connectTweetsToSocial;
