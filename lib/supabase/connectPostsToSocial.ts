import { Post, Social } from "../../types/agent";
import supabase from "./serverClient";

const connectPostsToSocial = async (
  social: Social,
  postUrls: string[],
): Promise<Post[]> => {
  try {
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .in("post_url", postUrls);
    if (!posts) return [];

    const post_ids = posts.map((post) => post.id);

    await supabase
      .from("social_posts")
      .delete()
      .eq("social_id", social.id)
      .in("post_id", post_ids);
    const social_posts = posts.map((post) => ({
      social_id: social.id,
      post_id: post.id,
    }));
    await supabase.from("social_posts").insert(social_posts);
    return posts;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default connectPostsToSocial;
