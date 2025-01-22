import { Funnel_Type } from "../funnels";
import supabase from "./serverClient";
import updateArtistProfile from "./updateArtistProfile";
import updateArtistSocials from "./updateArtistSocials";

const saveFunnelArtist = async (
  funnelType: string,
  nickname: string,
  avatar: string,
  instruction: string,
  label: string,
  knowledges: string,
  url: string,
  accountId: string | null = null,
  existingArtistId: string | null,
) => {
  let socialUrls: any = {
    twitter_url: "",
    tiktok_url: "",
    spotify_url: "",
    instagram_url: "",
  };
  if (funnelType === Funnel_Type.TIKTOK) socialUrls.tiktok_url = url;
  if (funnelType === Funnel_Type.TWITTER) socialUrls.twitter_url = url;
  if (funnelType === Funnel_Type.SPOTIFY) socialUrls.spotify_url = url;
  if (funnelType === Funnel_Type.INSTAGRAM) socialUrls.instagram_url = url;
  if (!funnelType) socialUrls = url;

  const id = await updateArtistProfile(
    accountId,
    avatar,
    nickname,
    instruction,
    label,
    knowledges,
    existingArtistId,
  );

  await updateArtistSocials(
    id,
    socialUrls.tiktok_url,
    "",
    "",
    socialUrls.instagram_url,
    socialUrls.twitter_url,
    socialUrls.spotify_url,
  );

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
    .eq("id", id)
    .single();

  return data;
};

export default saveFunnelArtist;
