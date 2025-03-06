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
  if (!socialIds.length) {
    return [];
  }

  const socialIdChunkSize = 100;
  const socialIdChunks = [];
  for (let i = 0; i < socialIds.length; i += socialIdChunkSize) {
    socialIdChunks.push(socialIds.slice(i, i + socialIdChunkSize));
  }

  let allSocialPosts: SocialPost[] = [];

  for (const socialIdChunk of socialIdChunks) {
    let page = 0;
    const pageSize = 1000;
    let hasMorePosts = true;

    while (hasMorePosts) {
      const { data: socialPostsPage, error: socialPostsError } = await supabase
        .from("social_posts")
        .select("post_id, social_id")
        .in("social_id", socialIdChunk)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (socialPostsError) {
        console.error(
          "[ERROR] Error fetching social_posts page:",
          socialPostsError
        );
        break;
      }

      if (!socialPostsPage || socialPostsPage.length === 0) {
        hasMorePosts = false;
      } else {
        allSocialPosts = allSocialPosts.concat(socialPostsPage);

        if (socialPostsPage.length < pageSize) {
          hasMorePosts = false;
        } else {
          page++;
        }
      }
    }
  }
  return allSocialPosts;
};

export default getSocialPostsByIds;
