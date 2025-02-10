import uploadPfpToIpfs from "../ipfs/uploadPfpToIpfs";
import uploadPfpToArweave from "../arweave/uploadPfpToArweave";
import supabase from "./serverClient";

const setArtistImage = async (
  artistId: string,
  image: string | null,
): Promise<string> => {
  try {
    if (!image) return "";

    // Try Arweave upload first
    const arweaveUrl = await uploadPfpToArweave(image);
    
    // Fallback to IPFS if Arweave upload fails
    const imageUrl = arweaveUrl || await uploadPfpToIpfs(image);
    if (!imageUrl) return "";

    const { data: artist_account } = await supabase
      .from("accounts")
      .select("*, account_info(*)")
      .eq("id", artistId)
      .single();
    const account_info = artist_account.account_info;

    if (account_info?.length === 0) {
      await supabase
        .from("account_info")
        .insert({
          account_id: artistId,
          image: imageUrl,
        })
        .select("*")
        .single();
    }

    const existingImage = account_info[0].image;
    if (!existingImage) {
      await supabase
        .from("account_info")
        .update({
          ...account_info[0],
          image: imageUrl,
        })
        .eq("id", account_info[0].id)
        .select("*")
        .single();
    }

    return imageUrl;
  } catch (error) {
    console.error("Error in setArtistImage:", error);
    return "";
  }
};

export default setArtistImage;
