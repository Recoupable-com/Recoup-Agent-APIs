import supabase from "./serverClient";

const setNewPosts = async (postUrls: Array<string>) => {
  try {
    const chunkSize = 100;
    const chunkCount =
      parseInt(Number(postUrls.length / chunkSize).toFixed(0), 10) + 1;

    for (let i = 0; i < chunkCount; i++) {
      const chunkPostUrls = postUrls.slice(chunkSize * i, chunkSize * (i + 1));
      const { data: existing_posts } = await supabase
        .from("posts")
        .select("*, post_comments(*)")
        .in("post_url", chunkPostUrls);
      const missing_post_urls = chunkPostUrls.filter(
        (postUrl) =>
          !existing_posts?.some(
            (existing_post) => existing_post.post_url === postUrl,
          ),
      );
      const missing_posts = missing_post_urls.map((missing_post_url) => ({
        post_url: missing_post_url,
      }));
      await supabase.from("posts").insert(missing_posts).select("*");
    }
  } catch (error) {
    console.error(error);
    return;
  }
};

export default setNewPosts;
