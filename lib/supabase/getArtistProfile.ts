import { getAccountSocials } from "./getAccountSocials";
import getSocialPostsByIds from "./getSocialPostsByIds";
import { calculateProfileMetrics } from "../utils/calculateProfileMetrics";
import { transformSocialToProfile } from "./transformSocialToProfile";
import { ArtistProfileResponse } from "../../types/artistProfile.types";
import {
  createErrorResponse,
  createEmptyProfile,
} from "../utils/artistProfileUtils";

/**
 * Get comprehensive profile information for an artist across all connected social media platforms
 * @param artistAccountId The unique identifier of the artist account
 * @returns Artist profile data including all social profiles and aggregated metrics
 */
export const getArtistProfile = async (
  artistAccountId: string
): Promise<ArtistProfileResponse> => {
  try {
    console.log("[DEBUG] Fetching artist profile for:", artistAccountId);

    const { status, socials } = await getAccountSocials(artistAccountId);

    if (status === "error") {
      console.error("[ERROR] Failed to fetch account socials");
      return createErrorResponse("Failed to fetch social profiles");
    }

    if (!socials.length) {
      console.log(
        "[DEBUG] No social profiles found for artist:",
        artistAccountId
      );
      return {
        status: "success",
        profile: createEmptyProfile(artistAccountId),
      };
    }

    const socialIds = socials.map((social) => social.id);
    const socialPosts = await getSocialPostsByIds(socialIds);
    const postCountMap = socialPosts.reduce(
      (acc, post) => {
        acc[post.social_id] = (acc[post.social_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const { totalFollowers, totalFollowing, totalPosts, latestUpdate } =
      calculateProfileMetrics(socials, postCountMap);

    const profiles = socials.map((social) =>
      transformSocialToProfile(social, postCountMap[social.id] || 0)
    );

    return {
      status: "success",
      profile: {
        id: artistAccountId,
        profiles,
        total_followers: totalFollowers,
        total_following: totalFollowing,
        total_posts: totalPosts,
        updated_at: latestUpdate.toISOString(),
      },
    };
  } catch (error) {
    console.error("[ERROR] Error in getArtistProfile:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};
