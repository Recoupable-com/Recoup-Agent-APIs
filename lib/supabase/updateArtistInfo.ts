import uploadPfpToIpfs from "../ipfs/uploadPfpToIpfs";
import supabase from "./serverClient";

const updateArtistInfo = async (artistId: string, image: string) => {
    const { data: artist_account } = await supabase.from("accounts").select("*, account_info(*)").eq("id", artistId).single();
    const account_info = artist_account.account_info
    const avatar = await uploadPfpToIpfs(image);
    if (account_info?.length === 0) {
      await supabase.from("account_info").insert({
        account_id: artistId,
        image: avatar
      })
    } else {
      const existingImage = account_info[0].image
      if (!existingImage) {
        await supabase.from("account_info").update({
          ...account_info[0],
          image: avatar
        })
      }
    }
}

export default updateArtistInfo