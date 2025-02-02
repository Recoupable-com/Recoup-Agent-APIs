import supabase from "./serverClient";

const savePosts = async (
  postUrls: string[],
  socialId: string
): Promise<void> => {
  try {
    // First, insert all posts
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .upsert(
        postUrls.map((url) => ({
          post_url: url,
        }))
      )
      .select("*");

    if (postsError) {
      console.error("Failed to save posts:", postsError);
      return;
    }

    // Then create social_posts associations
    const { error: socialPostsError } = await supabase
      .from("social_posts")
      .upsert(
        posts.map((post) => ({
          post_id: post.id,
          social_id: socialId,
        }))
      );

    if (socialPostsError) {
      console.error("Failed to save social_posts:", socialPostsError);
      return;
    }

    console.log(`✅ Saved ${posts.length} posts and their social associations`);
  } catch (error) {
    console.error("Error in savePosts:", error);
  }
};

export default savePosts;
