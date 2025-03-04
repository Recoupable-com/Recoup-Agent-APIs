import { AuthorInput, Social } from "../../types/agent";
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
): Promise<Social[]> {
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
  ) as Social[];

  let enhancedTikTokAuthors: Social[] = [];
  if (tiktokAuthors.length > 0) {
    console.log("Original tiktokAuthors:", tiktokAuthors);
    const { enhancedProfiles } = await enhanceTikTokProfiles(tiktokAuthors);
    console.log("Enhanced TikTok profiles:", enhancedProfiles);

    const mappedTikTokAuthors = enhancedProfiles.map((profile, index) => {
      // Get the original author data
      const originalAuthor = tiktokAuthors[index];

      return {
        // Use original profile_url and username
        profile_url: originalAuthor.profile_url,
        username: originalAuthor.username,
        // Add enhanced profile data
        avatar: profile.avatar,
        bio: profile.bio,
        followerCount: profile.followerCount,
        followingCount: profile.followingCount,
        region: profile.region,
      };
    });

    enhancedTikTokAuthors = mappedTikTokAuthors as Social[];
    console.log("Final mapped TikTok authors:", enhancedTikTokAuthors);
  }

  // Process Instagram authors
  let enhancedInstagramAuthors: Social[] = [];
  if (instagramAuthors.length > 0) {
    console.log("Original instagramAuthors:", instagramAuthors);
    const { enhancedProfiles } =
      await enhanceInstagramProfiles(instagramAuthors);
    console.log("Enhanced Instagram profiles:", enhancedProfiles);

    const mappedInstagramAuthors = enhancedProfiles.map((profile, index) => {
      // Get the original author data
      const originalAuthor = instagramAuthors[index];

      return {
        // Use original profile_url and username
        profile_url: originalAuthor.profile_url,
        username: originalAuthor.username,
        // Add enhanced profile data
        avatar: profile.avatar,
        bio: profile.bio,
        followerCount: profile.followerCount,
        followingCount: profile.followingCount,
        region: profile.region,
      };
    });

    enhancedInstagramAuthors = mappedInstagramAuthors as Social[];
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
