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
import supabase from "../lib/supabase/serverClient";
import getAgents from "../lib/stack/getAgents";
import { Address } from "viem";
import getSegmentsTotalSize from "../lib/agent/getSegmentsTotalSize";
import getAggregatedAgentSocials from "../lib/agent/getAggregatedAgentSocials";
import getReport from "../lib/getReport";
import createReport from "../lib/supabase/createReport";
import updateReport from "../lib/supabase/updateReport";

export const get_full_report = async (req: Request, res: Response) => {
  try {
    const { agentId, address, segmentName, email, artistId } = req.body;

    const { reportId } = await createReport(artistId);
    res.status(200).json({ reportId });

    if (!reportId) return;

    const { segments, commentIds } = await getAgents(
      agentId as string,
      address as Address,
    );
    const segment = segments.find(
      (segmentEle: any) => segmentEle.name === segmentName,
    );
    const totalSegmentSize = getSegmentsTotalSize(segments);
    const { followerCount, username, avatar } = await getAggregatedAgentSocials(
      agentId as string,
    );

    const segmentSize = (followerCount / totalSegmentSize) * segment.size;
    const segmentPercentage = Number(
      (segment.size / totalSegmentSize) * 100,
    ).toFixed(2);
    const segmentNames =
      segments?.map((segmentEle: any) => segmentEle?.name || "") || [];

    const { data: post_comments } = await supabase
      .from("post_comments")
      .select("*")
      .in("id", commentIds.slice(0, 100) || []);
    const comments = post_comments?.map((comment) => comment.comment) || [];

    const context = {
      segments: segmentNames,
      comments,
      segmentName,
      segmentSize,
      segmentPercentage,
    };
    const { reportContent, nextSteps } = await getReport(context);

    updateReport(reportId, reportContent, nextSteps);

    sendReportEmail(
      reportContent,
      avatar,
      username,
      email as string,
      `${segmentName} Report`,
    );
    return;
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
      2222,
    );

    sendReportEmail(
      content,
      data?.artistImage,
      data?.artistName,
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
              ?.replace(/```/g, ""),
          )?.data || [],
      });
    return res.status(500).json({ error: "No content received from OpenAI" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "API request failed" });
  }
};
