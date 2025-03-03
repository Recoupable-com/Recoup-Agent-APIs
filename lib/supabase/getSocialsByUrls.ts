import supabase from "./serverClient";
import { Database } from "../../types/database.types";

type Social = Database["public"]["Tables"]["socials"]["Row"];

interface GetSocialsByUrlsResponse {
  socialMap: { [profile_url: string]: string };
  error: Error | null;
}

/**
 * Fetches existing social records by profile URLs
 *
 * @param authors - Array of author objects containing username and profile_url
 * @returns Object mapping profile URLs to social IDs, or empty object if error
 *
 * @example
 * ```typescript
 * const authors = [{
 *   username: "user1",
 *   profile_url: "https://instagram.com/user1"
 * }];
 * const { socialMap, error } = await getSocialsByUrls(authors);
 * if (error) {
 *   console.error("Failed to fetch socials:", error);
 *   return;
 * }
 * // socialMap = { "https://instagram.com/user1": "social_id_1" }
 * ```
 */
const getSocialsByUrls = async (
  authors: Social[]
): Promise<GetSocialsByUrlsResponse> => {
  try {
    if (!authors.length) {
      return { socialMap: {}, error: null };
    }

    const profileUrls = authors.map((author) => author.profile_url);

    const { data: existingSocials, error: selectError } = await supabase
      .from("socials")
      .select("id, profile_url")
      .in("profile_url", profileUrls);

    if (selectError) {
      console.error("Failed to fetch existing socials:", selectError);
      return {
        socialMap: {},
        error: new Error("Failed to fetch existing socials"),
      };
    }

    const socialMap = existingSocials.reduce<{ [profile_url: string]: string }>(
      (acc, social) => {
        acc[social.profile_url] = social.id;
        return acc;
      },
      {}
    );

    return { socialMap, error: null };
  } catch (error) {
    console.error("Error in getSocialsByUrls:", error);
    return {
      socialMap: {},
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default getSocialsByUrls;
