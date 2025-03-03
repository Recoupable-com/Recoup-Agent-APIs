import { CommentInput } from "./savePostComments";
import extractUniqueAuthors from "../utils/extractUniqueAuthors";
import createSocials from "./createSocials";
import enhanceAuthorsWithAvatars from "../scraping/enhanceAuthorsWithAvatar";

/**
 * Creates or retrieves social records for comment authors
 *
 * This function orchestrates the process of:
 * 1. Extracting unique authors from comments
 * 2. Enhancing comment authors with avatars, bio, followers, following, etc.
 * 3. Upserting social records for all comment authors
 *
 * @param comments - Array of comments to process
 * @returns Object mapping usernames to social IDs
 */
const createOrGetCommentSocials = async (
  comments: CommentInput[]
): Promise<{ [username: string]: string }> => {
  try {
    // Extract unique authors with validated platforms
    const { authors, error: extractError } = extractUniqueAuthors(comments);
    if (extractError) {
      console.error("Failed to extract authors:", extractError);
      return {};
    }

    if (authors.length === 0) {
      return {};
    }

    // Convert profile_url map to username map for consistency
    const usernameMap = authors.reduce<{ [username: string]: string }>(
      (acc, author) => {
        acc[author.username] = acc[author.profile_url];
        return acc;
      },
      {}
    );

    if (authors.length > 0) {
      // Enhance TikTok profiles with avatars before creating social records
      const enhancedAuthors = await enhanceAuthorsWithAvatars(authors);

      // Create new social records
      const { socialMap: newSocials, error: createError } =
        await createSocials(enhancedAuthors);
      if (createError) {
        console.error("Failed to create new socials:", createError);
        return usernameMap;
      }

      // Merge existing and new social maps
      return { ...usernameMap, ...newSocials };
    }

    return usernameMap;
  } catch (error) {
    console.error("Error in createOrGetCommentSocials:", error);
    return {};
  }
};

export default createOrGetCommentSocials;
