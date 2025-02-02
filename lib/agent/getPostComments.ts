import supabase from "../supabase/serverClient";

const getPostComments = async (agent_status: any) => {
  const comments: any = [];
  const commentsPromise = agent_status.map(async (agent_status: any) => {
    const { data } = await supabase
      .from("socials")
      .select(
        `
          *
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
      .select("*")
      .single();

    if (data) {
      const post_ids = data.social_posts.map(
        (social_post: any) => social_post.post_id,
      );
      const chunkSize = 100;
      const chunkCount =
        parseInt(Number(post_ids.length / chunkSize).toFixed(0), 10) + 1;
      for (let i = 0; i < chunkCount; i++) {
        const chunkPostIds = post_ids.slice(chunkSize * i, chunkSize * (i + 1));
        const { data: posts } = await supabase
          .from("posts")
          .select("*, post_comments(*, social:socials(*))")
          .in("id", chunkPostIds);
        comments.push(posts);
      }
    }
  });

  await Promise.all(commentsPromise);
  return comments.flat();
};

export default getPostComments;
