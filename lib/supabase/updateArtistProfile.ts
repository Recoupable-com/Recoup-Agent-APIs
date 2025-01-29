import supabase from "./serverClient.js";

const updateArtistProfile = async (
  accountId: string | null,
  image: string,
  name: string,
  existingArtistId: string | null = null,
) => {
  if (existingArtistId) {
    const { data } = await supabase
      .from("accounts")
      .update({
        name,
        id: existingArtistId,
      })
      .eq("id", existingArtistId)
      .select("*, account_info(*)")
      .single();
    const account_info = data.account_info?.[0];
    console.log("ZIAD UPDATE WITH SELECT CHECK", account_info);
    if (account_info) {
      await supabase
        .from("account_info")
        .update({
          ...account_info,
          image,
        })
        .eq("id", account_info.id)
        .select("*")
        .single();
    } else {
      await supabase
        .from("account_info")
        .insert({
          image,
          account_id: existingArtistId,
        })
        .select("*")
        .single();
    }
    return existingArtistId;
  }

  const { data: new_artist_account } = await supabase
    .from("accounts")
    .insert({
      name,
    })
    .select("*")
    .single();
  await supabase.from("account_info").insert({
    image,
    account_id: new_artist_account.id,
  });

  if (!accountId) return existingArtistId;

  await supabase
    .from("account_artist_ids")
    .insert({
      account_id: accountId,
      artist_id: new_artist_account.id,
    })
    .select("*")
    .single();

  return new_artist_account.id;
};

export default updateArtistProfile;
