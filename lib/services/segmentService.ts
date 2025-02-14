import supabase from "../supabase/serverClient.js";
import generateSegments from "../generateSegments.js";

interface PostComment {
  comment: string;
  social_id: string;
  post_id: string;
}

interface SocialPost {
  post_id: string;
  social_id: string;
}

export const generateSegmentsForAccount = async (accountId: string) => {
  console.log("Starting generate_segments for accountId:", accountId);

  // Step 1: Get all account_socials for the artist
  const { data: accountSocials, error: accountSocialsError } = await supabase
    .from("account_socials")
    .select("social_id")
    .eq("account_id", accountId);

  if (accountSocialsError) {
    console.error("Error fetching account_socials:", accountSocialsError);
    throw new Error("Failed to fetch account socials");
  }

  if (!accountSocials?.length) {
    console.log("No social accounts found for accountId:", accountId);
    throw new Error("No social accounts found for this artist");
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
    throw new Error("Failed to fetch social posts");
  }

  if (!socialPosts?.length) {
    console.log("No posts found for social IDs:", socialIds);
    throw new Error("No posts found for these social accounts");
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
      allPostComments = allPostComments.concat(chunkComments as PostComment[]);
    }
  }

  if (allPostComments.length === 0) {
    console.log("No comments found for any posts");
    throw new Error("No comments found for these posts");
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
      allSocialPosts = allSocialPosts.concat(chunkSocialPosts as SocialPost[]);
    }
  }

  if (allSocialPosts.length === 0) {
    console.error("Failed to fetch social_posts data");
    throw new Error("Failed to fetch artist social IDs");
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
