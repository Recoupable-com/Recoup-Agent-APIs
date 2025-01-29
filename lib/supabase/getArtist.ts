import supabase from "./serverClient.js";

const getArtist = async (artist_id: string | null) => {
  const { data: account } = await supabase
    .from("account, account_info(*), account_socials(*)")
    .select("*")
    .eq("id", artist_id)
    .single();
  return {
    ...account.account_info[0],
    ...account,
  };
};

export default getArtist;
