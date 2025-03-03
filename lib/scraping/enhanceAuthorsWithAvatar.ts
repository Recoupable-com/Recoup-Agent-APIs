import { Social } from "../../types/agent";
import enhanceTikTokProfiles from "../tiktok/enhanceTikTokProfiles";

/**
 * Enhances authors with platform-specific data like avatars
 * Currently supports TikTok avatar enhancement
 *
 * @param authors Array of authors to enhance
 * @returns Enhanced authors with additional data where available
 */
async function enhanceAuthorsWithAvatars(authors: Social[]): Promise<Social[]> {
  if (!authors.length) {
    return [];
  }

  const tiktokAuthors = authors.filter((author) =>
    author.profile_url.includes("tiktok.com")
  );

  const otherAuthors = authors.filter(
    (author) => !author.profile_url.includes("tiktok.com")
  );

  let enhancedTikTokAuthors: Social[] = [];
  if (tiktokAuthors.length > 0) {
    const { enhancedProfiles } = await enhanceTikTokProfiles(tiktokAuthors);
    const mappedTikTokAuthors = enhancedProfiles.map((profile) => ({
      avatar: profile.avatar,
      bio: profile.bio,
      followerCount: profile.followerCount,
      followingCount: profile.followingCount,
      profile_url: profile.profile_url,
      region: profile.region,
      username: profile.username,
    }));
    enhancedTikTokAuthors = mappedTikTokAuthors as Social[];
  }

  return [...enhancedTikTokAuthors, ...otherAuthors];
}

export default enhanceAuthorsWithAvatars;
