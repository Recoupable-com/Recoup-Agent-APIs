import supabase from "./serverClient";
import type { Database } from "../../types/database.types";

type Social = Database["public"]["Tables"]["socials"]["Row"];

export const createOrGetSocial = async (
  username: string,
  profile_url: string,
  avatar?: string | null,
  bio?: string | null,
  followerCount?: number | null,
  followingCount?: number | null,
  region?: string | null
): Promise<{
  social: Social | null;
  error: Error | null;
}> => {
  console.log("createOrGetSocial", username, profile_url);
  try {
    // First try to find existing social record
    const { data: existingSocial, error: findError } = await supabase
      .from("socials")
      .select()
      .eq("profile_url", profile_url)
      .single();

    if (existingSocial) {
      return { social: existingSocial, error: null };
    }

    console.log("existingSocial", existingSocial);

    // If not found, create new social record
    const { data: newSocial, error: createError } = await supabase
      .from("socials")
      .insert({
        username,
        profile_url,
        avatar,
        bio,
        followerCount,
        followingCount,
        region,
      })
      .select()
      .single();

    if (createError) {
      console.error("Failed to create social record:", createError);
      return {
        social: null,
        error: new Error("Failed to create social record"),
      };
    }

    return { social: newSocial, error: null };
  } catch (error) {
    console.error("Error in createOrGetSocial:", error);
    return {
      social: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error in createOrGetSocial"),
    };
  }
};
