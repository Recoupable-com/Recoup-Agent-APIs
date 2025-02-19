import { CommentInput } from "../supabase/savePostComments";
import { AuthorInput } from "../supabase/createSocials";
import getSocialPlatformByLink from "../getSocialPlatformByLink";
import { isValidPlatform } from "./validatePlatform";
import { getProfileUrl } from "./getProfileUrl";

interface ExtractAuthorsResponse {
  authors: AuthorInput[];
  error: Error | null;
}

/**
 * Extracts unique authors from comments and validates their platform
 *
 * @param comments - Array of comments to extract authors from
 * @returns Array of unique authors with validated platform and profile URLs
 *
 * @example
 * ```typescript
 * const comments = [{
 *   text: "Great post!",
 *   timestamp: "2024-03-20T12:00:00Z",
 *   ownerUsername: "user1",
 *   postUrl: "https://instagram.com/p/123"
 * }];
 * const { authors, error } = extractUniqueAuthors(comments);
 * if (error) {
 *   console.error("Failed to extract authors:", error);
 *   return;
 * }
 * // authors = [{ username: "user1", profile_url: "https://instagram.com/user1" }]
 * ```
 */
const extractUniqueAuthors = (
  comments: CommentInput[]
): ExtractAuthorsResponse => {
  try {
    // Get unique usernames
    const uniqueUsernames = [...new Set(comments.map((c) => c.ownerUsername))];

    // Map each username to its first comment to get platform info
    const authors = uniqueUsernames
      .map((username) => {
        const comment = comments.find((c) => c.ownerUsername === username);
        if (!comment) {
          console.warn(`No comment found for username ${username}`);
          return null;
        }

        const platform = getSocialPlatformByLink(comment.postUrl);
        if (!isValidPlatform(platform)) {
          console.warn(
            `Could not detect valid platform for ${username} from ${comment.postUrl}`
          );
          return null;
        }

        return {
          username,
          profile_url: getProfileUrl(platform, username),
        };
      })
      .filter((author): author is AuthorInput => author !== null);

    if (authors.length === 0) {
      console.warn("No valid authors found after platform detection");
    }

    return { authors, error: null };
  } catch (error) {
    console.error("Error in extractUniqueAuthors:", error);
    return {
      authors: [],
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default extractUniqueAuthors;
