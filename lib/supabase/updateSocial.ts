import supabase from "./serverClient";
import { Database } from "../../types/database.types";

type Social = Database["public"]["Tables"]["socials"]["Row"];

const updateSocial = async (
  social_id: string,
  socialdata: Social
): Promise<{
  error: Error | null;
}> => {
  try {
    const { data: existing_social } = await supabase
      .from("socials")
      .select("*")
      .eq("id", social_id)
      .single();
    if (existing_social) {
      await supabase
        .from("socials")
        .update({
          ...existing_social,
          ...socialdata,
        })
        .eq("id", existing_social.id)
        .select("*")
        .single();
      return { error: null };
    }
    return { error: null };
  } catch (error) {
    console.error("Error creating social:", error);
    return {
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error creating social"),
    };
  }
};

export default updateSocial;
