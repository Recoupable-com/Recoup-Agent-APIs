import { Social } from "../../types/agent";
import supabase from "./serverClient";

interface GetSocialsByIdsResponse {
  status: string;
  socials: Social[];
}

/**
 * Gets social details for given social IDs
 * @param socialIds Array of social IDs to get details for
 * @returns Array of social details
 */
export const getSocialsByIds = async (
  socialIds: string[]
): Promise<GetSocialsByIdsResponse> => {
  try {
    if (!socialIds.length) {
      return {
        status: "success",
        socials: [],
      };
    }

    const { data: socials, error } = await supabase
      .from("socials")
      .select(
        "id, username, avatar, profile_url, region, bio, followerCount, followingCount, updated_at"
      )
      .in("id", socialIds);

    if (error) {
      console.error("[ERROR] Error fetching socials:", error);
      return {
        status: "error",
        socials: [],
      };
    }

    return {
      status: "success",
      socials: socials || [],
    };
  } catch (error) {
    console.error("[ERROR] Unexpected error in getSocialsByIds:", error);
    return {
      status: "error",
      socials: [],
    };
  }
};
