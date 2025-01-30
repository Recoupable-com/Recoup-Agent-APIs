import supabase from "./serverClient.js";

const getArtist = async (artist_id: string | null) => {
  const { data: account } = await supabase
    .from("accounts")
    .select("*, account_info(*), account_socials(*)")
    .eq("id", artist_id)
    .single();
  return {
    ...account.account_info[0],
    ...account,
    account_id: account.id,
  };
};

export default getArtist;
