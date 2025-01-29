import { Funnel_Type } from "../funnels";
import supabase from "./serverClient";
import updateArtistProfile from "./updateArtistProfile";
import updateArtistSocials from "./updateArtistSocials";

const saveFunnelArtist = async (
  funnelType: string,
  name: string,
  avatar: string,
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
    name,
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

  const { data: account } = await supabase
    .from("accounts")
    .select("*, account_info(*), account_socials(*)")
    .eq("id", existingArtistId)
    .single();

  return {
    ...account.account_info[0],
    ...account,
  };
};

export default saveFunnelArtist;
