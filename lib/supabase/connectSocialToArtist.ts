import { Account_Social, Social } from "../../types/agent";
import getSocialPlatformByLink from "../getSocialPlatformByLink";
import supabase from "./serverClient";

const connectSocialToArtist = async (artist_id: string, social: Social) => {
  try {
    const { data: artist } = await supabase
      .from("accounts")
      .select("*, account_socials(*, social:socials(*))")
      .eq("id", artist_id)
      .single();
    if (!artist) return;
    const account_socials = artist.account_socials;
    const existing_social = account_socials.find(
      (account_social: Account_Social & { social: Social }) =>
        getSocialPlatformByLink(account_social.social.profile_url) ===
        getSocialPlatformByLink(social.profile_url),
    );
    if (existing_social) return;

    await supabase
      .from("account_socials")
      .delete()
      .eq("account_id", artist_id)
      .eq("social_id", social.id);
    await supabase
      .from("account_socials")
      .insert({
        account_id: artist_id,
        social_id: social.id,
      })
      .select("*")
      .single();
  } catch (error) {
    console.error(error);
  }
};

export default connectSocialToArtist;
