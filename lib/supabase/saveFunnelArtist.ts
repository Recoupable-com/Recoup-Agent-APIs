import { Funnel_Type } from "../funnels";
import supabase from "./serverClient";
import updateArtistProfile from "./updateArtistProfile";
import updateArtistSocials from "./updateArtistSocials";
import type { Database } from "../../types/database.types";

type AccountSocial = Database["public"]["Tables"]["account_socials"]["Row"] & {
  socials?: {
    id: string;
    type: string;
    link: string;
  };
};

const saveFunnelArtist = async (
  funnelType: string,
  name: string,
  avatar: string,
  url: string,
  accountId: string | null = null,
  existingArtistId: string | null
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
    existingArtistId
  );

  await updateArtistSocials(
    id,
    socialUrls.tiktok_url,
    "",
    "",
    socialUrls.instagram_url,
    socialUrls.twitter_url,
    socialUrls.spotify_url
  );

  const { data: account } = await supabase
    .from("accounts")
    .select(
      `
      *,
      account_info (
        id,
        image,
        instruction,
        label,
        organization,
        knowledges
      ),
      account_socials (
        id,
        social_id,
        socials (
          id,
          type,
          link
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (!account) {
    throw new Error("Failed to fetch created artist");
  }

  return {
    id: account.id,
    account_id: account.id,
    name: account.name,
    timestamp: account.timestamp,
    image: account.account_info?.[0]?.image ?? null,
    organization: account.account_info?.[0]?.organization ?? null,
    instruction: account.account_info?.[0]?.instruction ?? null,
    label: account.account_info?.[0]?.label ?? null,
    knowledges: account.account_info?.[0]?.knowledges ?? null,
    socials:
      account.account_socials?.map((social: AccountSocial) => ({
        id: social.id,
        type: social.socials?.type,
        link: social.socials?.link,
      })) ?? [],
  };
};

export default saveFunnelArtist;
