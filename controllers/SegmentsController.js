import { instructions } from "../lib/instructions.js";
import {
  FULL_REPORT_NOTE,
  HTML_RESPONSE_FORMAT_INSTRUCTIONS,
  ICONS,
  REPORT_NEXT_STEP_NOTE,
} from "../lib/consts.js";
import getChatCompletions from "../lib/getChatCompletions.js";
import sendReportEmail from "../lib/email/sendReportEmail.js";

export const get_full_report = async (req, res) => {
  try {
    const data = req.body;
    const content = await getChatCompletions(
      [
        {
          role: "user",
          content: `
        Context: ${JSON.stringify(data)}
        Question: Please, create a tiktok fan segment report.`,
        },
        {
          role: "system",
          content: `${instructions.get_segements_report}
        ${HTML_RESPONSE_FORMAT_INSTRUCTIONS}
        NOTE: ${FULL_REPORT_NOTE}`,
        },
      ],
      2222,
    );

    sendReportEmail(
      content,
      data?.funnel_analytics_profile?.[0]?.avatar,
      data?.funnel_analytics_profile?.[0]?.nickname,
      data?.email || "",
      `${data?.segment_name} Report`,
    );
    if (content) return res.status(200).json({ content });
    return res.status(500).json({ error: "No content received from OpenAI" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "API request failed" });
  }
};

export const get_next_steps = async (req, res) => {
  try {
    const body = req.body;
    const content = await getChatCompletions([
      {
        role: "user",
        content: `Context: ${JSON.stringify(body)}`,
      },
      {
        role: "system",
        content: `${instructions.get_segments_report_next_step}
          ${HTML_RESPONSE_FORMAT_INSTRUCTIONS}
          NOTE: ${REPORT_NEXT_STEP_NOTE}`,
      },
    ]);
    if (content) return res.status(200).json({ data: content });
    return res.status(500).json({ error: "No content received from OpenAI" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "API request failed" });
  }
};

export const get_segments = async (req, res) => {
  try {
    const body = req.body;
    const content = await getChatCompletions([
      {
        role: "user",
        content: `Context: ${JSON.stringify(body)}`,
      },
      {
        role: "system",
        content: `${instructions.get_fan_segments} \n Response should be in JSON format. {"data": [{ "string": number }, { "string": number }]}.`,
      },
    ]);

    if (content)
      return res.status(200).json({
        data:
          JSON.parse(
            content
              ?.replaceAll("\n", "")
              ?.replaceAll("json", "")
              ?.replaceAll("```", ""),
          )?.data || [],
      });
    return res.status(500).json({ error: "No content received from OpenAI" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "API request failed" });
  }
};

export const get_segments_icons = async (req, res) => {
  try {
    const body = req.body;
    const content = await getChatCompletions([
      {
        role: "user",
        content: `**Icon Names**: ${JSON.stringify(ICONS)}\n
        **Segment Names**: ${JSON.stringify(body)}`,
      },
      {
        role: "system",
        content: `${instructions.get_segments_icons} \n Response should be in JSON format. {"data": {"segment_name1": "icon_name1", "segment_name2": "icon_name2", ...}}`,
      },
    ]);

    if (content)
      return res.status(200).json({
        data:
          JSON.parse(
            content
              ?.replaceAll("\n", "")
              ?.replaceAll("json", "")
              ?.replaceAll("```", ""),
          )?.data || [],
      });
    return res.status(500).json({ error: "No content received from OpenAI" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "API request failed" });
  }
};
