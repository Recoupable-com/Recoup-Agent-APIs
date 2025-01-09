import supabase from "./serverClient.js";

const updateArtistProfile = async (
  accountId,
  image,
  name,
  instruction,
  label,
  knowledges,
  existingArtistId = null,
) => {
  if (existingArtistId) {
    const { data: artistInfo } = await supabase
      .from("artists")
      .update({
        image,
        name,
        instruction,
        knowledges,
        label,
        timestamp: Date.now(),
      })
      .eq("id", existingArtistId)
      .select("*")
      .single();
    return artistInfo.id;
  }

  const { data: artistInfo } = await supabase
    .from("artists")
    .insert({
      image,
      name,
      instruction,
      knowledges,
      label,
      timestamp: Date.now(),
    })
    .select("*")
    .single();

  if (!accountId) return artistInfo.id;

  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId);
  if (!account || !account.length) throw Error("Account does not exist.");

  await supabase
    .from("accounts")
    .update({
      ...account[0],
      artistIds: [...account[0].artistIds, artistInfo.id],
    })
    .eq("id", account[0].id);
  return artistInfo.id;
};

export default updateArtistProfile;
