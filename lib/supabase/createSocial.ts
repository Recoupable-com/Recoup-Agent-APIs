import { Database } from "../../types/database.types";
import supabase from "./serverClient";

type Social = Database["public"]["Tables"]["socials"]["Row"];

const createSocial = async (
  socialdata: any,
): Promise<{
  social: Social | null;
  error: Error | null;
}> => {
  try {
    const { data: existing_social } = await supabase
      .from("socials")
      .select("*")
      .eq("profile_url", socialdata.profile_url)
      .single();

    if (existing_social) {
      const { data: updated_social } = await supabase
        .from("socials")
        .update({
          ...existing_social,
          username: socialdata.username,
        })
        .eq("id", existing_social.id)
        .select("*")
        .single();

      return { social: updated_social, error: null };
    }
    const { data: social, error: socialError } = await supabase
      .from("socials")
      .insert(socialdata)
      .select("*")
      .single();

    if (socialError) {
      console.error("Failed to create social:", socialError);
      return {
        social: null,
        error: new Error("Failed to create social record"),
      };
    }

    return { social, error: null };
  } catch (error) {
    console.error("Error creating social:", error);
    return {
      social: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error creating social"),
    };
  }
};

export default createSocial;
