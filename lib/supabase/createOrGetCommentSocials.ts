import { CommentInput } from "./savePostComments";
import extractUniqueAuthors from "../utils/extractUniqueAuthors";
import enhanceAuthorsWithAvatars from "../scraping/enhanceAuthorsWithAvatar";
import { EnhancedSocial } from "../../types/agent";

interface CommentSocialsResult {
  enhancedProfiles: EnhancedSocial[];
  usernameMap: { [username: string]: string };
}

/**
 * Extracts and enhances social profiles from comments
 *
 * This function orchestrates the process of:
 * 1. Extracting unique authors from comments
 * 2. Enhancing comment authors with avatars, bio, followers, following, etc.
 *
 * @param comments - Array of comments to process
 * @returns Object containing enhanced profiles and username mapping
 */
const createOrGetCommentSocials = async (
  comments: CommentInput[]
): Promise<CommentSocialsResult> => {
  try {
    const { authors, error: extractError } = extractUniqueAuthors(comments);
    if (extractError) {
      console.error("Failed to extract authors:", extractError);
      return { enhancedProfiles: [], usernameMap: {} };
    }

    if (authors.length === 0) {
      return { enhancedProfiles: [], usernameMap: {} };
    }

    const usernameMap = authors.reduce<{ [username: string]: string }>(
      (acc, author) => {
        acc[author.username] = author.profile_url;
        return acc;
      },
      {}
    );

    if (authors.length > 0) {
      const enhancedProfiles = await enhanceAuthorsWithAvatars(authors);
      return { enhancedProfiles, usernameMap };
    }

    return { enhancedProfiles: [], usernameMap };
  } catch (error) {
    console.error("Error in createOrGetCommentSocials:", error);
    return { enhancedProfiles: [], usernameMap: {} };
  }
};

export default createOrGetCommentSocials;
