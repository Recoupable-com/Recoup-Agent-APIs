import generateSegments from "../generateSegments.js";
import getAccountSocials from "../supabase/getAccountSocials.js";
import getPostComments from "../supabase/getPostComments.js";
import getSocialPosts from "../supabase/getSocialPosts.js";

export const generateSegmentsForAccount = async (accountId: string) => {
  console.log("Starting generate_segments for accountId:", accountId);

  // Step 1: Get all account_socials for the artist
  const accountSocials = await getAccountSocials(accountId);
  const socialIds = accountSocials.map((as) => as.social_id);
  console.log("Social IDs:", socialIds);

  // Step 2: Get all social_posts for these social_ids
  const allSocialPosts = await getSocialPosts(socialIds);
  const postIds = allSocialPosts.map((sp) => sp.post_id);
  console.log("Post IDs:", postIds);

  // Step 3: Get all post_comments for these posts
  const allPostComments = await getPostComments(postIds);

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
  console.log("Starting segment generation with formatted comments:", {
    totalComments: formattedComments.length,
    sampleComment: formattedComments[0],
    uniqueArtistSocialIds: [
      ...new Set(formattedComments.map((c) => c.artist_social_id)),
    ].length,
    uniqueFanSocialIds: [
      ...new Set(formattedComments.map((c) => c.fan_social_id)),
    ].length,
  });

  const segmentIds = await generateSegments(formattedComments);
  console.log("Generated segment IDs:", {
    total: segmentIds.length,
    uniqueIds: [...new Set(segmentIds)].length,
    sample: segmentIds.slice(0, 3),
  });

  return {
    segmentIds,
    totalComments: formattedComments.length,
    stats: {
      uniqueArtistSocialIds: [
        ...new Set(formattedComments.map((c) => c.artist_social_id)),
      ].length,
      uniqueFanSocialIds: [
        ...new Set(formattedComments.map((c) => c.fan_social_id)),
      ].length,
      uniqueSegmentIds: [...new Set(segmentIds)].length,
    },
  };
};
