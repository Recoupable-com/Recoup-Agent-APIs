import { ScrapedComment } from "../scraping/types";
import createSocials from "./createSocials";

/**
 * Creates initial social records for comment authors
 * @param comments Array of scraped comments
 * @returns Map of usernames to their social IDs
 */
const createCommentSocials = async (
  comments: ScrapedComment[]
): Promise<{ [username: string]: string }> => {
  const uniqueAuthors = [
    ...new Set(comments.map((comment) => comment.username)),
  ];

  console.log("[DEBUG] Creating initial social records for comment authors:", {
    authorCount: uniqueAuthors.length,
  });

  // Map comments to author objects
  const authors = uniqueAuthors
    .map((username) => {
      const comment = comments.find((c) => c.username === username);
      if (!comment) return null;
      return {
        username,
        profile_url: comment.profile_url,
      };
    })
    .filter((author): author is NonNullable<typeof author> => author !== null);

  const { socialMap, error } = await createSocials(authors);

  if (error) {
    console.error("[ERROR] Failed to create initial social records:", {
      error: error.message,
      authorCount: uniqueAuthors.length,
    });
    return {};
  }

  console.log("[DEBUG] Created initial social records:", {
    totalCreated: Object.keys(socialMap).length,
    totalAuthors: uniqueAuthors.length,
  });

  return socialMap;
};

export default createCommentSocials;
