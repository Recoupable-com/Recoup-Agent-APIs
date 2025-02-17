import { instructions } from "../lib/instructions";
import {
  FULL_REPORT_NOTE,
  HTML_RESPONSE_FORMAT_INSTRUCTIONS,
  ICONS,
  REPORT_NEXT_STEP_NOTE,
} from "../lib/consts";
import getChatCompletions from "../lib/getChatCompletions";
import sendReportEmail from "../lib/email/sendReportEmail";
import { Request, Response } from "express";
import getReport from "../lib/getReport";
import createReport from "../lib/supabase/createReport";
import updateReport from "../lib/supabase/updateReport";
import { generateSegmentsForAccount } from "../lib/services/segmentService";
import getArtistSegmentComments from "../lib/supabase/getArtistSegmentComments";

export const create_report = async (req: Request, res: Response) => {
  try {
    const { segmentName, email, artistId } = req.body;

    const { reportId } = await createReport(artistId);
    res.status(200).json({ reportId });
    if (!reportId) return;

    const { comments, socialMetrics } = await getArtistSegmentComments(
      artistId,
      segmentName
    );
    const { followerCount, username, avatar } = socialMetrics;

    const segmentSize = comments.length;
    const segmentPercentage = ((segmentSize / followerCount) * 100).toFixed(2);

    const context = {
      comments,
      segmentName,
      segmentSize,
      segmentPercentage,
    };
    const { reportContent, nextSteps } = await getReport(context);

    await updateReport(reportId, reportContent, nextSteps);
    await sendReportEmail(
      reportContent,
      avatar,
      username,
      email,
      `${segmentName} Report`
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "API request failed" });
  }
};

export const get_pitch_report = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const content = await getChatCompletions(
      [
        {
          role: "user",
          content: `
        Context: ${JSON.stringify(data)}
        Question: Please create a pitch HTML report if the pitch name is ${data?.pitch_name}.`,
        },
        {
          role: "system",
          content: `${instructions.get_pitch_report}
        ${HTML_RESPONSE_FORMAT_INSTRUCTIONS}
        NOTE: ${FULL_REPORT_NOTE}`,
        },
      ],
      2222
    );

    sendReportEmail(
      content,
      data?.artistImage,
      data?.artistName,
      data?.email || "",
      `${data?.segment_name} Report`
    );
    if (content) return res.status(200).json({ content });
    return res.status(500).json({ error: "No content received from OpenAI" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "API request failed" });
  }
};

export const get_next_steps = async (req: Request, res: Response) => {
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

export const get_segments_icons = async (req: Request, res: Response) => {
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
              ?.replace(/\n/g, "")
              ?.replace(/json/g, "")
              ?.replace(/```/g, "")
          )?.data || [],
      });
    return res.status(500).json({ error: "No content received from OpenAI" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "API request failed" });
  }
};

export const generate_segments = async (req: Request, res: Response) => {
  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({
      success: false,
      error: "accountId is required",
    });
  }

  try {
    const result = await generateSegmentsForAccount(accountId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in generate_segments:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
