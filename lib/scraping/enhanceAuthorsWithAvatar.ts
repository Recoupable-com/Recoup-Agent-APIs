import { AuthorInput, Social } from "../../types/agent";
import enhanceTikTokProfiles from "../tiktok/enhanceTikTokProfiles";

/**
 * Enhances authors with platform-specific data like avatars
 * Currently supports TikTok avatar enhancement
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

  const otherAuthors = authors.filter(
    (author) => !author.profile_url.includes("tiktok.com")
  ) as Social[];

  let enhancedTikTokAuthors: Social[] = [];
  if (tiktokAuthors.length > 0) {
    console.log("Original tiktokAuthors:", tiktokAuthors);
    const { enhancedProfiles } = await enhanceTikTokProfiles(tiktokAuthors);
    console.log("Enhanced profiles:", enhancedProfiles);

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

  return [...otherAuthors, ...enhancedTikTokAuthors];
}

export default enhanceAuthorsWithAvatars;
