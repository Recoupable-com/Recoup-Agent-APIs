import supabase from "../serverClient";

type SelectSocialsParams = {
  id?: string;
};

export async function selectSocials(params: SelectSocialsParams) {
  let query = supabase
    .from("socials")
    .select("*")
    .order("updated_at", { ascending: false });

  if (params.id) {
    query = query.eq("id", params.id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch socials: ${error.message}`);
  }

  return data || [];
}
