import { AuthorInput, EnhancedSocial } from "../../types/agent";
import enhanceTikTokProfiles from "../tiktok/enhanceTikTokProfiles";
import enhanceInstagramProfiles from "../instagram/enhanceInstagramProfiles";

/**
 * Enhances authors with platform-specific data like avatars
 * Currently supports TikTok and Instagram avatar enhancement
 *
 * @param authors Array of authors to enhance
 * @returns Enhanced authors with additional data where available
 */
async function enhanceAuthorsWithAvatars(
  authors: AuthorInput[]
): Promise<EnhancedSocial[]> {
  if (!authors.length) {
    return [];
  }

  const tiktokAuthors = authors.filter((author) =>
    author.profile_url.includes("tiktok.com")
  );

  const instagramAuthors = authors.filter((author) =>
    author.profile_url.includes("instagram.com")
  );

  const otherAuthors = authors.filter(
    (author) =>
      !author.profile_url.includes("tiktok.com") &&
      !author.profile_url.includes("instagram.com")
  ) as EnhancedSocial[];

  let enhancedTikTokAuthors: EnhancedSocial[] = [];
  if (tiktokAuthors.length > 0) {
    console.log("Original tiktokAuthors:", tiktokAuthors);
    const { enhancedProfiles } = await enhanceTikTokProfiles(tiktokAuthors);
    console.log("Enhanced TikTok profiles:", enhancedProfiles);

    enhancedTikTokAuthors = enhancedProfiles.map((profile, index) => {
      // Get the original author data
      const originalAuthor = tiktokAuthors[index];

      return {
        ...profile,
        // Override with original profile_url and username
        profile_url: originalAuthor.profile_url,
        username: originalAuthor.username,
      } as EnhancedSocial;
    });

    console.log("Final mapped TikTok authors:", enhancedTikTokAuthors);
  }

  // Process Instagram authors
  let enhancedInstagramAuthors: EnhancedSocial[] = [];
  if (instagramAuthors.length > 0) {
    console.log("Original instagramAuthors:", instagramAuthors);

    const { enhancedProfiles } =
      await enhanceInstagramProfiles(instagramAuthors);
    console.log("Enhanced Instagram profiles:", enhancedProfiles);

    enhancedInstagramAuthors = enhancedProfiles.map((profile, index) => {
      // Get the original author data
      const originalAuthor = instagramAuthors[index];

      return {
        ...profile,
        // Override with original profile_url and username
        profile_url: originalAuthor.profile_url,
        username: originalAuthor.username,
      } as EnhancedSocial;
    });

    console.log("Final mapped Instagram authors:", enhancedInstagramAuthors);
  }

  // Combine all enhanced authors
  return [
    ...otherAuthors,
    ...enhancedTikTokAuthors,
    ...enhancedInstagramAuthors,
  ];
}

export default enhanceAuthorsWithAvatars;
