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
          let fanProfile = {
            profile: social,
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
              .select("*")
              .single();
          }

          await supabase
            .from("fan_segment")
            .delete()
            .eq("social_id", social.id)
            .eq("artist_id", artistId);
          await supabase.from("fan_segment").insert({
            segment_name: segmentName,
            artist_id: artistId,
            social_id: social.id,
          });
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
