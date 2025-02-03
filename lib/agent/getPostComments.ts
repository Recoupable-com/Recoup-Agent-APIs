import supabase from "../supabase/serverClient";

const getPostComments = async (agent_status: any) => {
  const comments: any = [];
  const commentsPromise = agent_status.map(async (agent_status: any) => {
    const { data } = await supabase
      .from("socials")
      .select(
        `
          *,
          social_posts (
            *,
            posts (
              *
            )
          ),
          social_spotify_tracks (
            *,
            spotify_tracks (
              *
            )
          ),
          social_spotify_albums (
            *,
            spotify_albums (
              *
            )
          )
      `,
      )
      .eq("id", agent_status.social_id)
      .single();

    if (data) {
      const socialPosts = data.social_posts;
      const post_ids = socialPosts.map(
        (social_post: any) => social_post.post_id,
      );
      const chunkSize = 100;
      const chunkCount =
        parseInt(Number(post_ids.length / chunkSize).toFixed(0), 10) + 1;
      for (let i = 0; i < chunkCount; i++) {
        const chunkPostIds = post_ids.slice(chunkSize * i, chunkSize * (i + 1));
        const { data: posts } = await supabase
          .from("posts")
          .select("*, post_comments(*)")
          .in("id", chunkPostIds);
        if (posts) {
          const post_comments = posts.map((post) => post.post_comments);
          comments.push(post_comments);
          if (comments.flat().length > 500) break;
        }
      }
    }
  });

  await Promise.all(commentsPromise);
  return comments.flat();
};

export default getPostComments;
