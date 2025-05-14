import { Database } from "../../types/database.types";
import supabase from "./serverClient";

type SocialPost = Database["public"]["Tables"]["social_posts"]["Insert"];

/**
 * Inserts social_posts records
 *
 * @param socialPosts - Array of social post records to insert
 * @returns Promise resolving to void
 */
const insertSocialPosts = async (socialPosts: SocialPost[]): Promise<void> => {
  try {
    const { error } = await supabase.from("social_posts").insert(socialPosts);

    if (error) {
      console.error("Error inserting social posts:", error);
    }
  } catch (error) {
    console.error("Error in insertSocialPosts:", error);
  }
};

export default insertSocialPosts;
