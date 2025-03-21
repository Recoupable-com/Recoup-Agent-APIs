import { ScrapedComment, ScrapedProfile } from "../scraping/types";
import { EnhancedSocial } from "../../types/agent";
import enhanceAuthorsWithAvatars from "../scraping/enhanceAuthorsWithAvatar";
import { AgentService } from "../services/AgentService";

/**
 * Enhances social records with additional profile data for comment authors
 * @param comments Array of scraped comments
 * @returns Array of enhanced social profiles
 */
const enhanceCommentSocials = async (
  comments: ScrapedComment[]
): Promise<EnhancedSocial[]> => {
  const uniqueAuthors = [
    ...new Set(comments.map((comment) => comment.username)),
  ];

  console.log("[DEBUG] Enhancing social records for comment authors:", {
    authorCount: uniqueAuthors.length,
  });

  try {
    const authors = uniqueAuthors
      .map((username) => {
        const comment = comments.find((c) => c.username === username);
        if (!comment) return null;
        return {
          username,
          profile_url: comment.profile_url,
        };
      })
      .filter((author) => author !== null);

    const enhancedProfiles = await enhanceAuthorsWithAvatars(authors);

    console.log("[DEBUG] Enhanced social records:", {
      totalEnhanced: enhancedProfiles.length,
      totalAuthors: authors.length,
    });

    const agentService = new AgentService();

    for (const profile of enhancedProfiles) {
      const scrapedProfile: ScrapedProfile = {
        username: profile.username,
        profile_url: profile.profile_url,
        avatar: profile.avatar ?? undefined,
        followerCount: profile.followerCount ?? undefined,
        followingCount: profile.followingCount ?? undefined,
        description: profile.bio ?? undefined,
      };
      await agentService.updateSocial(profile.id, scrapedProfile);
    }

    return enhancedProfiles;
  } catch (error) {
    console.error("[ERROR] Failed to enhance comment socials:", {
      error: error instanceof Error ? error.message : String(error),
      authorCount: uniqueAuthors.length,
    });
    return [];
  }
};

export default enhanceCommentSocials;
