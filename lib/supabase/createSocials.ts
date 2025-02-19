import supabase from "./serverClient";
import { Database } from "../../types/database.types";

export interface AuthorInput {
  username: string;
  profile_url: string;
}

interface CreateSocialsResponse {
  socialMap: { [username: string]: string };
  error: Error | null;
}

/**
 * Creates new social records for the given authors
 *
 * @param authors - Array of author objects containing username and profile_url
 * @returns Object mapping usernames to newly created social IDs
 *
 * @example
 * ```typescript
 * const authors = [{
 *   username: "user1",
 *   profile_url: "https://instagram.com/user1"
 * }];
 * const { socialMap, error } = await createSocials(authors);
 * if (error) {
 *   console.error("Failed to create socials:", error);
 *   return;
 * }
 * // socialMap = { "user1": "new_social_id_1" }
 * ```
 */
const createSocials = async (
  authors: AuthorInput[]
): Promise<CreateSocialsResponse> => {
  try {
    if (!authors.length) {
      return { socialMap: {}, error: null };
    }

    const { data: newSocials, error: insertError } = await supabase
      .from("socials")
      .insert(authors)
      .select("id, username");

    if (insertError) {
      console.error("Failed to create new socials:", insertError);
      return {
        socialMap: {},
        error: new Error("Failed to create new socials"),
      };
    }

    const socialMap = (newSocials || []).reduce<{ [username: string]: string }>(
      (acc, social) => {
        acc[social.username] = social.id;
        return acc;
      },
      {}
    );

    return { socialMap, error: null };
  } catch (error) {
    console.error("Error in createSocials:", error);
    return {
      socialMap: {},
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default createSocials;
