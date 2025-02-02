import supabase from "./serverClient";

const updateSocial = async (
  social_id: string,
  socialdata: any,
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
      const { data: existing_socials } = await supabase
        .from("socials")
        .select("*")
        .eq("profile_url", socialdata.profile_url);
      console.log("ZIAD existing_socials", existing_socials);
      console.log("ZIAD OKAY", {
        ...existing_social,
        ...socialdata,
      });
      const { error } = await supabase
        .from("socials")
        .update({
          ...existing_social,
          ...socialdata,
        })
        .eq("id", existing_social.id)
        .select("*")
        .single();
      console.log("ZIAD", error);
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
