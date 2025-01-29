import getChatCompletions from "./getChatCompletions";
import { instructions } from "./instructions";
import getAnalyses from "./supabase/getAnalyses";

const getFansSegments = async (pilot_id: string) => {
  try {
    const funnel_analyses: any = await getAnalyses(pilot_id);
    const segments = funnel_analyses
      .map((analysis: any) => analysis.funnel_analytics_segments)
      .flat()
      .map((segment: any) => segment.name);
    const comments = funnel_analyses
      .map((analysis: any) => analysis.funnel_analytics_comments)
      .flat()
      .map((comment: any) => ({
        username: comment.username,
        comment: comment.comment,
      }));

    const content = await getChatCompletions(
      [
        {
          role: "user",
          content: `
            [COMMENTS]: ${JSON.stringify(comments.slice(0, 500))}
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

    return fansSegments;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default getFansSegments;
