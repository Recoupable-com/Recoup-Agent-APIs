import { ICONS } from "./consts.js";
import getChatCompletions from "./getChatCompletions.js";
import { instructions } from "./instructions.js";

const getSegmentsWithIcons = async (
  segments: any,
  analysisId: string | null = null,
) => {
  try {
    const content = await getChatCompletions([
      {
        role: "user",
        content: `**Icon Names**: ${JSON.stringify(ICONS)}\n
            **Segment Names**: ${JSON.stringify(segments)}`,
      },
      {
        role: "system",
        content: `${instructions.get_segments_icons} \n Response should be in JSON format. {"data": {"segment_name1": "icon_name1", "segment_name2": "icon_name2", ...}}`,
      },
    ]);

    if (content) {
      const reply =
        JSON.parse(
          content
            ?.replace(/\n/g, "")
            ?.replace(/json/g, "")
            ?.replace(/```/g, ""),
        )?.data || [];
      const segmentsWithIcons = segments.map((segment: any) => {
        const iconName = reply[`${Object.keys(segment)[0]}`];
        const icon = ICONS.find((name) => name.includes(iconName));
        return {
          name: Object.keys(segment)[0],
          icon: icon || "",
          size: Object.values(segment)[0],
          analysis_id: analysisId,
        };
      });

      return segmentsWithIcons;
    }

    throw new Error("No content received from OpenAI");
  } catch (error) {
    console.error(error);
    throw new Error("API request failed");
  }
};
export default getSegmentsWithIcons;
