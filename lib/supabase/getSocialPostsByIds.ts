import supabase from "./serverClient";

interface SocialPost {
  post_id: string;
  social_id: string;
}

/**
 * Fetches social posts for a list of social IDs with pagination
 * @param socialIds Array of social IDs to fetch posts for
 * @returns Array of social posts
 */
export const getSocialPostsByIds = async (
  socialIds: string[]
): Promise<SocialPost[]> => {
  console.log("[DEBUG] getSocialPostsByIds called with:", {
    socialIdsCount: socialIds.length,
    socialIds,
  });

  if (!socialIds.length) {
    console.log("[DEBUG] No social IDs provided, returning empty array");
    return [];
  }

  const socialIdChunkSize = 100;
  const socialIdChunks = [];
  for (let i = 0; i < socialIds.length; i += socialIdChunkSize) {
    socialIdChunks.push(socialIds.slice(i, i + socialIdChunkSize));
  }

  console.log("[DEBUG] Split social IDs into chunks:", {
    totalChunks: socialIdChunks.length,
    chunkSize: socialIdChunkSize,
  });

  let allSocialPosts: SocialPost[] = [];

  for (const socialIdChunk of socialIdChunks) {
    console.log("[DEBUG] Processing social ID chunk:", {
      chunkSize: socialIdChunk.length,
      chunkIds: socialIdChunk,
    });

    let page = 0;
    const pageSize = 1000;
    let hasMorePosts = true;

    while (hasMorePosts) {
      console.log("[DEBUG] Fetching page of social posts:", {
        page,
        pageSize,
        rangeStart: page * pageSize,
        rangeEnd: (page + 1) * pageSize - 1,
      });

      const { data: socialPostsPage, error: socialPostsError } = await supabase
        .from("social_posts")
        .select("post_id, social_id")
        .in("social_id", socialIdChunk)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (socialPostsError) {
        console.error("[ERROR] Error fetching social_posts page:", {
          error: socialPostsError,
          page,
          socialIdChunk,
        });
        break;
      }

      if (!socialPostsPage || socialPostsPage.length === 0) {
        console.log("[DEBUG] No more posts found for current chunk");
        hasMorePosts = false;
      } else {
        console.log("[DEBUG] Found posts in current page:", {
          postsCount: socialPostsPage.length,
          firstFewPosts: socialPostsPage.slice(0, 5),
        });

        allSocialPosts = allSocialPosts.concat(socialPostsPage);

        if (socialPostsPage.length < pageSize) {
          console.log("[DEBUG] Page not full, no more posts to fetch");
          hasMorePosts = false;
        } else {
          console.log("[DEBUG] Page full, fetching next page");
          page++;
        }
      }
    }
  }

  console.log("[DEBUG] getSocialPostsByIds complete:", {
    totalPostsFound: allSocialPosts.length,
    uniqueSocialIds: [...new Set(allSocialPosts.map((sp) => sp.social_id))]
      .length,
    uniquePostIds: [...new Set(allSocialPosts.map((sp) => sp.post_id))].length,
  });

  return allSocialPosts;
};

export default getSocialPostsByIds;
