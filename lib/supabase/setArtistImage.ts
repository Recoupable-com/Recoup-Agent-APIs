import uploadPfpToIpfs from "../ipfs/uploadPfpToIpfs";
import supabase from "./serverClient";

const setArtistImage = async (
  artistId: string,
  image: string | null,
): Promise<void> => {
  if (!image) return;
  const { data: artist_account } = await supabase
    .from("accounts")
    .select("*, account_info(*)")
    .eq("id", artistId)
    .single();
  const account_info = artist_account.account_info;
  if (account_info?.length === 0) {
    const avatar = await uploadPfpToIpfs(image);
    const { data: new_account_info } = await supabase
      .from("account_info")
      .insert({
        account_id: artistId,
        image: avatar,
      })
      .select("*")
      .single();
    return new_account_info;
  }
  const existingImage = account_info[0].image;
  if (!existingImage) {
    const avatar = await uploadPfpToIpfs(image);
    const { data: existing_account_info } = await supabase
      .from("account_info")
      .update({
        ...account_info[0],
        image: avatar,
      })
      .eq("id", account_info[0].id)
      .select("*")
      .single();
    return existing_account_info;
  }
  return account_info[0];
};

export default setArtistImage;
