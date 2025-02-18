import supabase from "./serverClient";

interface GetSocialsByUsernamesResponse {
  socialMap: { [username: string]: string };
  error: Error | null;
}

/**
 * Fetches existing social records by usernames
 *
 * @param usernames - Array of usernames to look up
 * @returns Object mapping usernames to social IDs, or empty object if error
 *
 * @example
 * ```typescript
 * const { socialMap, error } = await getSocialsByUsernames(["user1", "user2"]);
 * if (error) {
 *   console.error("Failed to fetch socials:", error);
 *   return;
 * }
 * // socialMap = { "user1": "social_id_1", "user2": "social_id_2" }
 * ```
 */
const getSocialsByUsernames = async (
  usernames: string[]
): Promise<GetSocialsByUsernamesResponse> => {
  try {
    if (!usernames.length) {
      return { socialMap: {}, error: null };
    }

    const { data: existingSocials, error: selectError } = await supabase
      .from("socials")
      .select("id, username")
      .in("username", usernames);

    if (selectError) {
      console.error("Failed to fetch existing socials:", selectError);
      return {
        socialMap: {},
        error: new Error("Failed to fetch existing socials"),
      };
    }

    const socialMap = existingSocials.reduce<{ [username: string]: string }>(
      (acc, social) => {
        acc[social.username] = social.id;
        return acc;
      },
      {}
    );

    return { socialMap, error: null };
  } catch (error) {
    console.error("Error in getSocialsByUsernames:", error);
    return {
      socialMap: {},
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default getSocialsByUsernames;
