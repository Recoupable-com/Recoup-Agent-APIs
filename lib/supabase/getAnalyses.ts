import supabase from "./serverClient";

const getAnalyses = async (pilot_id: string | null) => {
  const { data } = await supabase
    .from("funnel_analytics")
    .select(
      `*,
      accounts (
        *,
        account_info (
          *
        ),
        account_socials (
          *
        )
      ),
      funnel_analytics_segments (
        *
      ),
      funnel_analytics_accounts (
        *,
        accounts (
          *,
          account_info (
            *
          ),
          account_socials (
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
    .eq("pilot_id", pilot_id);

  return data;
};

export default getAnalyses;
