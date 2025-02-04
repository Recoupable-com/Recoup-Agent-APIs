import getSocialPlatformByLink from "../getSocialPlatformByLink";
import getTikTokFanProfile from "../tiktok/getFanProfile";
import getTwitterFanProfile from "../twitter/getProfile";
import supabase from "./serverClient";
import { Scraper } from "agent-twitter-client";

const scraper = new Scraper();

const connectFansSegmentsToArtist = async (
  fansSegments: any,
  artistId: string,
) => {
  try {
    const { data: account_socials } = await supabase
      .from("account_socials")
      .select("*, social:socials(*)")
      .eq("account_id", artistId);

    if (!account_socials) return;
    const artist_socials: any = {};
    account_socials.map((account_social) => {
      artist_socials[
        `${getSocialPlatformByLink(account_social.social.profile_url).toLowerCase()}`
      ] = account_social.id;
    });
    const connectPromise = fansSegments.map(async (fanSegment: any) => {
      try {
        const segmentName = Object.values(fanSegment)[0];
        const username = Object.keys(fanSegment)[0];

        const { data: social } = await supabase
          .from("socials")
          .select("*")
          .eq("username", username)
          .single();
        if (social) {
          const socialPlatform = getSocialPlatformByLink(social.profile_url);
          let fanProfile: any = {
            profile: null,
          };
          if (socialPlatform === "TWITTER")
            fanProfile = await getTwitterFanProfile(scraper, username);
          if (socialPlatform === "TIKTOK")
            fanProfile = await getTikTokFanProfile(username);

          if (fanProfile?.profile) {
            await supabase
              .from("socials")
              .update({
                ...social,
                ...fanProfile?.profile,
              })
              .eq("id", social.id)
              .select("*")
              .single();

            if (artist_socials[`${socialPlatform.toLowerCase()}`]) {
              await supabase
                .from("artist_fan_segment")
                .delete()
                .eq("fan_social_id", social.id)
                .eq(
                  "artist_social_id",
                  artist_socials[`${socialPlatform.toLowerCase()}`],
                );
              await supabase.from("artist_fan_segment").insert({
                segment_name: segmentName,
                artist_social_id:
                  artist_socials[`${socialPlatform.toLowerCase()}`],
                fan_social_id: social.id,
              });
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    });

    await Promise.all(connectPromise);
    return;
  } catch (error) {
    console.error(error);
    return;
  }
};

export default connectFansSegmentsToArtist;
