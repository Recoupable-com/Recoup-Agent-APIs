import supabase from "./serverClient.js";

const getArtist = async (artist_id: string | null) => {
  const { data } = await supabase
    .from("artists")
    .select(
      `
        *,
        artist_social_links (
          *
        )
      `,
    )
    .eq("id", artist_id)
    .single();

  return data;
};

export default getArtist;
