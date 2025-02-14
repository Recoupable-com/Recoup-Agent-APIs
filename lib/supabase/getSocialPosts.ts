import supabase from "./serverClient.js";

interface SocialPost {
  post_id: string;
  social_id: string;
}

export const getSocialPosts = async (socialIds: string[]) => {
  console.log(
    "[DEBUG] Fetching social posts for social IDs:",
    socialIds.length
  );

  // Split socialIds into chunks to avoid URL length limits
  const chunkSize = 20;
  const socialIdChunks = [];
  for (let i = 0; i < socialIds.length; i += chunkSize) {
    socialIdChunks.push(socialIds.slice(i, i + chunkSize));
  }
  console.log(
    "[DEBUG] Split into",
    socialIdChunks.length,
    "chunks of size",
    chunkSize
  );

  let allSocialPosts: SocialPost[] = [];
  for (const chunk of socialIdChunks) {
    console.log("[DEBUG] Processing chunk of", chunk.length, "social IDs");
    const { data: chunkPosts, error: chunkError } = await supabase
      .from("social_posts")
      .select("post_id, social_id")
      .in("social_id", chunk);

    if (chunkError) {
      console.error("[ERROR] Error fetching social_posts chunk:", chunkError);
      continue;
    }

    if (chunkPosts?.length) {
      console.log("[DEBUG] Found", chunkPosts.length, "posts in current chunk");
      allSocialPosts = allSocialPosts.concat(chunkPosts as SocialPost[]);
    }
  }

  if (allSocialPosts.length === 0) {
    console.log("[DEBUG] No posts found for social IDs:", socialIds);
    throw new Error("No posts found for these social accounts");
  }

  console.log("[DEBUG] Found total social_posts:", allSocialPosts.length);
  return allSocialPosts;
};

export default getSocialPosts;
