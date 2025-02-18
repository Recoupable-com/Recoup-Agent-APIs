import { CommentInput } from "./savePostComments";
import extractUniqueAuthors from "../utils/extractUniqueAuthors";
import getSocialsByUsernames from "./getSocialsByUsernames";
import createSocials from "./createSocials";

/**
 * Creates or retrieves social records for comment authors
 *
 * This function orchestrates the process of:
 * 1. Extracting unique authors from comments
 * 2. Fetching existing social records
 * 3. Creating new social records for missing authors
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

    // Get existing social records
    const { socialMap: existingSocials, error: fetchError } =
      await getSocialsByUsernames(authors.map((a) => a.username));
    if (fetchError) {
      console.error("Failed to fetch existing socials:", fetchError);
      return {};
    }

    // Find authors that need new social records
    const authorsToCreate = authors.filter(
      (author) => !existingSocials[author.username]
    );

    if (authorsToCreate.length > 0) {
      // Create new social records
      const { socialMap: newSocials, error: createError } =
        await createSocials(authorsToCreate);
      if (createError) {
        console.error("Failed to create new socials:", createError);
        return existingSocials;
      }

      // Merge existing and new social maps
      return { ...existingSocials, ...newSocials };
    }

    return existingSocials;
  } catch (error) {
    console.error("Error in createOrGetCommentSocials:", error);
    return {};
  }
};

export default createOrGetCommentSocials;
