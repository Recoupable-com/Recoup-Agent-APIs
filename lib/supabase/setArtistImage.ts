import uploadPfpToIpfs from "../ipfs/uploadPfpToIpfs";
import uploadPfpToArweave from "../arweave/uploadPfpToArweave";
import supabase from "./serverClient";

const setArtistImage = async (
  artistId: string,
  image: string | null,
): Promise<string> => {
  try {
    if (!image) {
      console.log(`No image provided for artist ${artistId}`);
      return "";
    }

    const arweaveUrl = await uploadPfpToArweave(image);
    if (!arweaveUrl) {
      console.log(`Arweave upload failed for artist ${artistId}, trying IPFS`);
    }
    
    const imageUrl = arweaveUrl || await uploadPfpToIpfs(image);
    if (!imageUrl) {
      console.error(`Both Arweave and IPFS uploads failed for artist ${artistId}`);
      return "";
    }

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
    console.error(`Error in setArtistImage for ${artistId}:`, error);
    return "";
  }
};

export default setArtistImage;
