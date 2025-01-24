import extracMails from "../extracMails";
import getChatCompletions from "../getChatCompletions";
import { instructions } from "../instructions";
import getFunnelAnalysis from "../supabase/getFunnelAnalysis";

const getFansProfiles = async (
  scraper: any,
  analysis_id: string,
  artistId: string = "",
) => {
  try {
    const data: any = await getFunnelAnalysis(analysis_id);
    const segments = data.funnel_analytics_segments.map(
      (segment: any) => segment.name,
    );
    const comments = data.funnel_analytics_comments.map((comment: any) => ({
      username: comment.username,
      comment: comment.comment,
    }));

    const content = await getChatCompletions(
      [
        {
          role: "user",
          content: `
            [COMMENTS]: ${JSON.stringify(comments)}
            [SEGMENTS]: ${JSON.stringify(segments)}`,
        },
        {
          role: "system",
          content: `${instructions.sort_fans_on_segments} \n Response should be in JSON format. {"data": [{ "string": string }, { "string": string }]}.`,
        },
      ],
      2222,
    );

    let fansSegments = [];
    if (content)
      fansSegments =
        JSON.parse(
          content
            ?.replace(/\n/g, "")
            ?.replace(/json/g, "")
            ?.replace(/```/g, ""),
        )?.data || [];

    const profilesPromise = fansSegments.map(async (segment: any) => {
      try {
        const profile: any = await scraper.getProfile(Object.keys(segment)[0]);
        const avatar = profile.avatar;
        const bio = profile.biography;
        const followerCount = profile.followersCount;
        const handle = Object.keys(segment)[0];
        const email = extracMails(bio);

        return {
          handle,
          email,
          bio,
          segment: Object.values(segment)[0],
          followerCount,
          avatar,
          artistId,
        };
      } catch (error) {
        return null;
      }
    });

    const profiles = await Promise.all(profilesPromise);

    return profiles;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default getFansProfiles;
