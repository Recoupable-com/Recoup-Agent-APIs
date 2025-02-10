import uploadPfpToIpfs from "../ipfs/uploadPfpToIpfs";
import uploadPfpToArweave from "../arweave/uploadPfpToArweave";
import supabase from "./serverClient";

const setArtistImage = async (
  artistId: string,
  image: string | null,
): Promise<string> => {
  try {
    if (!image) {
      console.log("⚠️ No image provided to setArtistImage");
      return "";
    }

    console.log("🖼️ Starting image upload process...");
    console.log("🔗 Source image URL:", image);

    // Try Arweave upload first
    console.log("📤 Attempting Arweave upload...");
    const arweaveUrl = await uploadPfpToArweave(image);
    
    if (arweaveUrl) {
      console.log("✅ Arweave upload successful:", arweaveUrl);
    } else {
      console.log("⚠️ Arweave upload failed, falling back to IPFS...");
    }
    
    // Fallback to IPFS if Arweave upload fails
    const imageUrl = arweaveUrl || await uploadPfpToIpfs(image);
    if (!imageUrl) {
      console.log("❌ Both Arweave and IPFS uploads failed");
      return "";
    }

    console.log("📝 Updating artist account info with new image URL:", imageUrl);

    const { data: artist_account } = await supabase
      .from("accounts")
      .select("*, account_info(*)")
      .eq("id", artistId)
      .single();
    const account_info = artist_account.account_info;

    if (account_info?.length === 0) {
      console.log("➕ Creating new account_info record");
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
      console.log("🔄 Updating existing account_info record");
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

    console.log("✅ Artist image update complete");
    return imageUrl;
  } catch (error) {
    console.error("❌ Error in setArtistImage:", error);
    return "";
  }
};

export default setArtistImage;
