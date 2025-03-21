import { Post } from "../../types/agent";
import supabase from "./serverClient";

const connectPostsToSocial = async (
  socialId: string,
  postUrls: string[]
): Promise<Post[]> => {
  try {
    let posts: Post[] = [];
    const chunkSize = 100;
    const chunkCount =
      parseInt(Number(postUrls.length / chunkSize).toFixed(0), 10) + 1;

    for (let i = 0; i < chunkCount; i++) {
      const chunkPostUrls = postUrls.slice(chunkSize * i, chunkSize * (i + 1));
      const { data: existing_posts } = await supabase
        .from("posts")
        .select("*")
        .in("post_url", chunkPostUrls);
      if (existing_posts) {
        const post_ids = existing_posts.map((post) => post.id);
        await supabase
          .from("social_posts")
          .delete()
          .eq("social_id", socialId)
          .in("post_id", post_ids);
        const social_posts = existing_posts.map((post) => ({
          social_id: socialId,
          post_id: post.id,
          updated_at: new Date().toISOString(),
        }));
        await supabase.from("social_posts").insert(social_posts);
        posts = posts.concat(existing_posts);
      }
    }

    return posts;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default connectPostsToSocial;
