import { getSocialsByIds } from "./getSocialsByIds.js";
import { Comment } from "../types/segment.types.js";

/**
 * Fetches social data for a batch of comments and attaches it to each comment
 *
 * @param comments - Array of comments without social data
 * @returns Array of comments with social data attached
 */
const getSocialDataForComments = async (
  comments: Comment[]
): Promise<Comment[]> => {
  if (!comments.length) {
    return [];
  }

  try {
    // Get unique fan social IDs
    const uniqueFanSocialIds = [
      ...new Set(comments.map((c) => c.fan_social_id)),
    ];
    console.log(
      `[DEBUG] Fetching social data for ${uniqueFanSocialIds.length} unique fan profiles`
    );

    // Process social IDs in batches to avoid 414 Request-URI Too Large error
    const BATCH_SIZE = 100; // Smaller batch size to avoid URI length limits
    const allSocials: any[] = [];

    // Process in batches
    for (let i = 0; i < uniqueFanSocialIds.length; i += BATCH_SIZE) {
      const batchIds = uniqueFanSocialIds.slice(i, i + BATCH_SIZE);
      console.log(
        `[DEBUG] Fetching socials batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uniqueFanSocialIds.length / BATCH_SIZE)} (${batchIds.length} IDs)`
      );

      const { socials, status } = await getSocialsByIds(batchIds);

      if (status !== "success" || !socials.length) {
        console.warn(
          `[WARN] Failed to fetch social data or no socials found for batch ${Math.floor(i / BATCH_SIZE) + 1}`
        );
        continue; // Continue with next batch instead of failing completely
      }

      allSocials.push(...socials);
    }

    if (!allSocials.length) {
      console.warn(
        `[WARN] No social data found for any of the ${uniqueFanSocialIds.length} IDs`
      );
      return comments;
    }

    console.log(
      `[DEBUG] Retrieved ${allSocials.length}/${uniqueFanSocialIds.length} social profiles in total`
    );

    // Create a map for quick lookup
    const socialDataMap = allSocials.reduce<
      Record<string, Comment["social_data"]>
    >((map, social) => {
      map[social.id] = {
        username: social.username || undefined,
        bio: social.bio || undefined,
        followerCount: social.followerCount || undefined,
        followingCount: social.followingCount || undefined,
      };
      return map;
    }, {});

    // Attach social data to comments
    return comments.map((comment) => ({
      ...comment,
      social_data: socialDataMap[comment.fan_social_id] || {},
    }));
  } catch (error) {
    console.error("[ERROR] Failed to fetch social data for comments:", error);
    // Return original comments without social data in case of error
    return comments;
  }
};

export default getSocialDataForComments;
