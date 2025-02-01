import getBlob from "./getBlob.js";
import { uploadToIpfs } from "./ipfs.js";

const uploadPfpToIpfs = async (image: string) => {
  if (!image) return "";
  try {
    const { blob, type } = await getBlob(image);
    const avatarBlob = new Blob([blob], { type });
    const avatarCid = await uploadToIpfs(avatarBlob);
    if (!avatarCid) return "";
    return `https://ipfs.decentralized-content.com/ipfs/${avatarCid}`;
  } catch (error) {
    console.error("Error in uploadPfpToIpfs:", error);
    return "";
  }
};

export default uploadPfpToIpfs;
