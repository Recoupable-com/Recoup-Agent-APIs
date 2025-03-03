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

  console.log(
    `Enhancing ${authors.length} authors with platform-specific data`
  );

  // Separate TikTok profiles from other platforms
  const tiktokAuthors = authors.filter((author) =>
    author.profile_url.includes("tiktok.com")
  );

  const otherAuthors = authors.filter(
    (author) => !author.profile_url.includes("tiktok.com")
  );

  // Enhance TikTok profiles with avatars
  let enhancedTikTokAuthors: AuthorInput[] = [];
  if (tiktokAuthors.length > 0) {
    console.log(
      `Enhancing ${tiktokAuthors.length} TikTok profiles with avatars`
    );
    const { enhancedProfiles, stats } =
      await enhanceTikTokProfiles(tiktokAuthors);
    enhancedTikTokAuthors = enhancedProfiles;
    console.log(`TikTok enhancement stats:`, stats);
  }

  // Combine all authors
  return [...enhancedTikTokAuthors, ...otherAuthors];
}

export default enhanceAuthorsWithAvatars;
