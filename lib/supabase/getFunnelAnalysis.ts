import supabase from "./serverClient";

const getFunnelAnalysis = async (analysis_id: string | null) => {
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
    .eq("id", analysis_id);

  return data;
};

export default getFunnelAnalysis;
