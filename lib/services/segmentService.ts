import generateSegments from "../generateSegments.js";
import getAccountSocials from "../supabase/getAccountSocials.js";
import getPostComments from "../supabase/getPostComments.js";
import getSocialPosts from "../supabase/getSocialPosts.js";
import getSocialDataForComments from "../supabase/getSocialDataForComments.js";
import { Comment } from "../types/segment.types.js";

export const generateSegmentsForAccount = async (accountId: string) => {
  console.log("Starting generate_segments for accountId:", accountId);

  // Initialize counters for progress tracking
  let totalProcessedSocials = 0;
  let totalProcessedPosts = 0;
  let totalProcessedComments = 0;
  const formattedComments: Comment[] = [];

  // Track unique fan_social_ids and their most recent comments
  const fanCommentMap = new Map<string, Comment>();

  // Step 1: Get all account_socials for the artist
  const accountSocialsResponse = await getAccountSocials(accountId);
  const accountSocials = accountSocialsResponse.socials;
  console.log("Found account_socials:", accountSocials.length);

  // Process social accounts in batches
  const SOCIAL_BATCH_SIZE = 5;
  for (let i = 0; i < accountSocials.length; i += SOCIAL_BATCH_SIZE) {
    const socialBatch = accountSocials.slice(i, i + SOCIAL_BATCH_SIZE);
    const socialIds = socialBatch.map((as) => as.id);

    console.log(
      `Processing social batch ${i / SOCIAL_BATCH_SIZE + 1}/${Math.ceil(
        accountSocials.length / SOCIAL_BATCH_SIZE
      )}`
    );

    // Step 2: Get social_posts for this batch of socials
    const socialPosts = await getSocialPosts(socialIds);
    if (socialPosts.length === 0) {
      console.log("No posts found for social batch, continuing to next batch");
      continue;
    }

    // Create a map of post_id to artist_social_id for this batch
    const postToArtistMap = socialPosts.reduce<Record<string, string>>(
      (acc, sp) => {
        acc[sp.post_id] = sp.social_id;
        return acc;
      },
      {}
    );

    // Step 3: Get post_comments for these posts
    const postIds = socialPosts.map((sp) => sp.post_id);
    const postComments = await getPostComments(postIds);

    // Step 4: Format and accumulate comments
    const batchFormattedComments = postComments.map((pc) => ({
      comment_text: pc.comment,
      fan_social_id: pc.social_id,
      artist_social_id: postToArtistMap[pc.post_id] || "",
    }));

    // Update fan comment map with most recent comments
    batchFormattedComments.forEach((comment) => {
      if (!fanCommentMap.has(comment.fan_social_id)) {
        fanCommentMap.set(comment.fan_social_id, comment);
      }
    });

    // Update progress
    totalProcessedSocials += socialBatch.length;
    totalProcessedPosts += socialPosts.length;
    totalProcessedComments += postComments.length;

    console.log("Progress:", {
      processedSocials: totalProcessedSocials,
      totalSocials: accountSocials.length,
      processedPosts: totalProcessedPosts,
      processedComments: totalProcessedComments,
      uniqueFans: fanCommentMap.size,
      currentBatchStats: {
        socials: socialBatch.length,
        posts: socialPosts.length,
        comments: postComments.length,
        newUniqueFans: fanCommentMap.size - formattedComments.length,
      },
    });

    // Optional: Add a small delay between batches to prevent rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Convert fan comment map to array
  const dedupedComments = Array.from(fanCommentMap.values());

  if (dedupedComments.length === 0) {
    console.log("No comments found for any social accounts");
    return {
      segmentIds: [],
      totalComments: 0,
      stats: {
        uniqueArtistSocialIds: 0,
        uniqueFanSocialIds: 0,
        uniqueSegmentIds: 0,
      },
    };
  }

  // Step 5: Enhance comments with social data
  console.log("Enhancing comments with social data...");
  const enhancedComments = await getSocialDataForComments(dedupedComments);

  // Step 6: Generate segments
  console.log("Starting segment generation with enhanced comments:", {
    totalRawComments: totalProcessedComments,
    totalDedupedComments: enhancedComments.length,
    deduplicationRate: `${(
      (1 - enhancedComments.length / totalProcessedComments) *
      100
    ).toFixed(2)}%`,
    sampleComment: enhancedComments[0],
    uniqueArtistSocialIds: [
      ...new Set(enhancedComments.map((c) => c.artist_social_id)),
    ].length,
    uniqueFanSocialIds: [
      ...new Set(enhancedComments.map((c) => c.fan_social_id)),
    ].length,
    withSocialData: enhancedComments.filter(
      (c) => c.social_data && Object.keys(c.social_data).length > 0
    ).length,
  });

  const { segmentIds, fanSegmentCount, error } = await generateSegments(
    enhancedComments,
    accountId
  );

  if (error) {
    console.error("[ERROR] Failed to generate segments:", error);
    throw error;
  }

  console.log("Generated segments:", {
    segmentCount: segmentIds.length,
    fanSegmentCount,
  });

  return {
    segmentIds,
    totalComments: enhancedComments.length,
    stats: {
      uniqueArtistSocialIds: [
        ...new Set(enhancedComments.map((c) => c.artist_social_id)),
      ].length,
      uniqueFanSocialIds: [
        ...new Set(enhancedComments.map((c) => c.fan_social_id)),
      ].length,
      uniqueSegmentIds: segmentIds.length,
      fanSegmentCount,
    },
  };
};
