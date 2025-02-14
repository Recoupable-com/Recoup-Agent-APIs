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
import generateSegments from "../lib/generateSegments";

export const create_report = async (req: Request, res: Response) => {
  try {
    const { agentId, address, segmentName, email, artistId } = req.body;

    const { reportId } = await createReport(artistId);
    res.status(200).json({ reportId });

    if (!reportId) return;

    const { segments, commentIds } = await getAgents(
      agentId as string,
      address as Address
    );
    const segment = segments.find(
      (segmentEle: any) => segmentEle.name === segmentName
    );
    const totalSegmentSize = getSegmentsTotalSize(segments);
    const { followerCount, username, avatar } = await getAggregatedAgentSocials(
      agentId as string
    );

    const segmentSize = (followerCount / totalSegmentSize) * segment.size;
    const segmentPercentage = Number(
      (segment.size / totalSegmentSize) * 100
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
      `${segmentName} Report`
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
    console.log("Starting generate_segments for accountId:", accountId);

    // Step 1: Get all account_socials for the artist
    const { data: accountSocials, error: accountSocialsError } = await supabase
      .from("account_socials")
      .select("social_id")
      .eq("account_id", accountId);

    if (accountSocialsError) {
      console.error("Error fetching account_socials:", accountSocialsError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch account socials",
      });
    }

    if (!accountSocials?.length) {
      console.log("No social accounts found for accountId:", accountId);
      return res.status(404).json({
        success: false,
        error: "No social accounts found for this artist",
      });
    }

    console.log("Found account_socials:", accountSocials.length);
    const socialIds = accountSocials.map((as) => as.social_id);
    console.log("Social IDs:", socialIds);

    // Step 2: Get all social_posts for these social_ids
    const { data: socialPosts, error: socialPostsError } = await supabase
      .from("social_posts")
      .select("post_id")
      .in("social_id", socialIds);

    if (socialPostsError) {
      console.error("Error fetching social_posts:", socialPostsError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch social posts",
      });
    }

    if (!socialPosts?.length) {
      console.log("No posts found for social IDs:", socialIds);
      return res.status(404).json({
        success: false,
        error: "No posts found for these social accounts",
      });
    }

    console.log("Found social_posts:", socialPosts.length);
    const postIds = socialPosts.map((sp) => sp.post_id);
    console.log("Post IDs:", postIds);

    // Step 3: Get all post_comments for these posts
    console.log("Fetching post_comments for", postIds.length, "posts");

    // Split postIds into smaller chunks to avoid URL length limits
    const chunkSize = 20;
    const postIdChunks = [];
    for (let i = 0; i < postIds.length; i += chunkSize) {
      postIdChunks.push(postIds.slice(i, i + chunkSize));
    }
    console.log("Split into", postIdChunks.length, "chunks of size", chunkSize);

    interface PostComment {
      comment: string;
      social_id: string;
      post_id: string;
    }

    interface SocialPost {
      post_id: string;
      social_id: string;
    }

    let allPostComments: PostComment[] = [];
    for (const chunk of postIdChunks) {
      console.log("Processing chunk of", chunk.length, "post IDs");
      const { data: chunkComments, error: chunkError } = await supabase
        .from("post_comments")
        .select(
          `
          comment,
          social_id,
          post_id
        `
        )
        .in("post_id", chunk);

      if (chunkError) {
        console.error("Error fetching post_comments chunk:", chunkError);
        continue;
      }

      if (chunkComments?.length) {
        console.log("Found", chunkComments.length, "comments in current chunk");
        allPostComments = allPostComments.concat(
          chunkComments as PostComment[]
        );
      }
    }

    if (allPostComments.length === 0) {
      console.log("No comments found for any posts");
      return res.status(404).json({
        success: false,
        error: "No comments found for these posts",
      });
    }

    console.log("Found total post_comments:", allPostComments.length);

    // Get the social_posts data separately
    console.log("Fetching social_posts data for", postIds.length, "posts");

    // Split postIds into chunks for social_posts query
    let allSocialPosts: SocialPost[] = [];
    for (const chunk of postIdChunks) {
      console.log(
        "Processing social_posts chunk of",
        chunk.length,
        "post IDs:",
        chunk
      );
      const { data: chunkSocialPosts, error: chunkError } = await supabase
        .from("social_posts")
        .select("post_id, social_id")
        .in("post_id", chunk);

      if (chunkError) {
        console.error("Error fetching social_posts chunk:", chunkError);
        continue;
      }

      if (chunkSocialPosts?.length) {
        console.log(
          "Found",
          chunkSocialPosts.length,
          "social_posts in current chunk"
        );
        allSocialPosts = allSocialPosts.concat(
          chunkSocialPosts as SocialPost[]
        );
      }
    }

    if (allSocialPosts.length === 0) {
      console.error("Failed to fetch social_posts data");
      return res.status(500).json({
        success: false,
        error: "Failed to fetch artist social IDs",
      });
    }

    console.log("Found total social_posts:", allSocialPosts.length);

    // Create a map of post_id to artist_social_id
    const postToArtistMap = allSocialPosts.reduce<Record<string, string>>(
      (acc, sp) => {
        acc[sp.post_id] = sp.social_id;
        return acc;
      },
      {}
    );

    // Step 4: Format comments for segment generation
    const formattedComments = allPostComments.map((pc) => ({
      comment_text: pc.comment,
      fan_social_id: pc.social_id,
      artist_social_id: postToArtistMap[pc.post_id] || "",
    }));

    console.log("Formatted comments:", formattedComments.length);

    // Step 5: Generate segments
    const segmentIds = await generateSegments(formattedComments);
    console.log("Generated segment IDs:", segmentIds.length);

    return res.status(200).json({
      success: true,
      data: {
        segmentIds,
        totalComments: formattedComments.length,
      },
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
