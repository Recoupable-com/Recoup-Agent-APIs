import enhanceTikTokProfiles from "../tiktok/enhanceSocialData";
import { AuthorInput } from "../supabase/createSocials";

interface Author {
  username: string;
  profile_url: string;
}
/**
 * Enhances authors with platform-specific data like avatars
 * Currently supports TikTok avatar enhancement
 *
 * @param authors Array of authors to enhance
 * @returns Enhanced authors with additional data where available
 */
async function enhanceAuthorsWithAvatars(
  authors: Author[]
): Promise<AuthorInput[]> {
  if (!authors.length) {
    return [];
  }

  const tiktokAuthors = authors.filter((author) =>
    author.profile_url.includes("tiktok.com")
  );

  const otherAuthors = authors.filter(
    (author) => !author.profile_url.includes("tiktok.com")
  );

  let enhancedTikTokAuthors: AuthorInput[] = [];
  if (tiktokAuthors.length > 0) {
    const { enhancedProfiles, stats } =
      await enhanceTikTokProfiles(tiktokAuthors);
    enhancedTikTokAuthors = enhancedProfiles;
  }

  return [...enhancedTikTokAuthors, ...otherAuthors];
}

export default enhanceAuthorsWithAvatars;
