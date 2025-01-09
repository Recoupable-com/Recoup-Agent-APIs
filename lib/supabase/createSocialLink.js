import supabase from "./serverClient.js";

const createSocialLink = async (artistId, social_type, social_link) => {
  const { data } = await supabase
    .from("artist_social_links")
    .select("*")
    .eq("artistId", artistId)
    .eq("type", social_type);

  if (data && data?.length) {
    if (!social_link) return;
    await supabase
      .from("artist_social_links")
      .update({
        ...data[0],
        link: social_link,
      })
      .eq("id", data[0].id);
    return;
  }

  await supabase.from("artist_social_links").insert({
    link: social_link,
    type: social_type,
    artistId: artistId,
  });
};

export default createSocialLink;
