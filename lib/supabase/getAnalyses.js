import supabase from "./serverClient.js";

const getAnalyses = async (chat_id) => {
  const { data } = await supabase
    .from("funnel_analytics")
    .select(
      `*,
      funnel_analytics_segments (
        *
      ),
      funnel_analytics_profile (
        *,
        artists (
          *,
          artist_social_links (
            *
          )
        )
      ),
      funnel_analytics_comments (
        *
      ),
      spotify_analytics_albums (
        *
      ),
      spotify_analytics_tracks (
        *
      )`,
    )
    .eq("chat_id", chat_id);

  return data;
};

export default getAnalyses;
