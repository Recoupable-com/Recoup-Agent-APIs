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
    const { authors, error: extractError } = extractUniqueAuthors(comments);
    if (extractError) {
      console.error("Failed to extract authors:", extractError);
      return {};
    }

    if (authors.length === 0) {
      return {};
    }

    const usernameMap = authors.reduce<{ [username: string]: string }>(
      (acc, author) => {
        acc[author.username] = acc[author.profile_url];
        return acc;
      },
      {}
    );

    if (authors.length > 0) {
      const enhancedAuthors = await enhanceAuthorsWithAvatars(authors);

      const { socialMap: newSocials, error: createError } =
        await createSocials(enhancedAuthors);
      if (createError) {
        console.error("Failed to create new socials:", createError);
        return usernameMap;
      }

      return { ...usernameMap, ...newSocials };
    }

    return usernameMap;
  } catch (error) {
    console.error("Error in createOrGetCommentSocials:", error);
    return {};
  }
};

export default createOrGetCommentSocials;
