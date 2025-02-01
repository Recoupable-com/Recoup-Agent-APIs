import supabase from "./serverClient";

const getScrapingPosts = async (postUrls: string[]) => {
  try {
    const { data: posts } = await supabase
      .from("posts")
      .select("*, post_comments(*)")
      .in("post_url", postUrls);

    return posts?.filter((post) => !post.post_comments.length) || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default getScrapingPosts;
