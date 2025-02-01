import supabase from "./serverClient";

const setNewPosts = async (postUrls: Array<string>) => {
  try {
    const { data: existing_posts } = await supabase
      .from("posts")
      .select("*, post_comments(*)")
      .in("post_url", postUrls);
    console.log("ZIAD existing posts", postUrls);
    const missing_post_urls = postUrls.filter(
      (postUrl) =>
        !existing_posts?.some(
          (existing_post) => existing_post.post_url === postUrl,
        ),
    );
    const missing_posts = missing_post_urls.map((missing_post_url) => ({
      post_url: missing_post_url,
    }));
    const { data: new_posts } = await supabase
      .from("posts")
      .insert(missing_posts)
      .select("*");
    console.log("ZIAD", new_posts);
    return;
  } catch (error) {
    console.error(error);
    return;
  }
};

export default setNewPosts;
