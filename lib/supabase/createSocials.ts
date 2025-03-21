import supabase from "./serverClient";
import { Social } from "../../types/agent";

interface CreateSocialsResponse {
  socialMap: { [username: string]: string };
  socials: Social[];
  error: Error | null;
}

type MinimalSocial = Pick<Social, "username" | "profile_url">;

/**
 * Creates or updates social records for the given authors
 *
 * @param authors - Array of author objects containing username and profile_url
 * @returns Object containing:
 *  - socialMap: mapping usernames to created/updated social IDs
 *  - socials: array of created/updated social records
 *  - error: any error that occurred
 *
 * @example
 * ```typescript
 * const authors = [{
 *   username: "user1",
 *   profile_url: "https://instagram.com/user1"
 * }];
 * const { socialMap, socials, error } = await createSocials(authors);
 * if (error) {
 *   console.error("Failed to create socials:", error);
 *   return;
 * }
 * // socialMap = { "user1": "social_id_1" }
 * // socials = [{ id: "social_id_1", username: "user1", ... }]
 * ```
 */
const createSocials = async (
  authors: MinimalSocial[]
): Promise<CreateSocialsResponse> => {
  try {
    if (!authors.length) {
      return { socialMap: {}, socials: [], error: null };
    }

    // Filter out authors with empty profile_url or username
    const validAuthors = authors.filter(
      (author) => author.profile_url && author.username
    );

    console.log(
      `Filtered out ${authors.length - validAuthors.length} authors with empty profile_url or username`
    );

    const { data: upsertedSocials, error: upsertError } = await supabase
      .from("socials")
      .upsert(validAuthors, {
        onConflict: "profile_url",
        ignoreDuplicates: false, // Update existing records
      })
      .select("*");

    if (upsertError) {
      console.error("Failed to create/update socials:", upsertError);
      return {
        socialMap: {},
        socials: [],
        error: new Error("Failed to create/update socials"),
      };
    }

    const socialMap = (upsertedSocials || []).reduce<{
      [username: string]: string;
    }>((acc, social) => {
      acc[social.username] = social.id;
      return acc;
    }, {});

    return { socialMap, socials: upsertedSocials || [], error: null };
  } catch (error) {
    console.error("Error in createSocials:", error);
    return {
      socialMap: {},
      socials: [],
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default createSocials;
