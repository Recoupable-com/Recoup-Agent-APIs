import getBlob from "../ipfs/getBlob";
import uploadToArweave from "./uploadToArweave";

const uploadPfpToArweave = async (image: string): Promise<string | null> => {
  try {
    // Get image blob and type
    const { blob, type } = await getBlob(image);
    const base64Data = Buffer.from(await blob.arrayBuffer()).toString("base64");

    const transaction = await uploadToArweave(
      {
        base64Data,
        mimeType: type || "image/png",
      },
      () => {}
    );

    if (!transaction?.id) {
      return null;
    }

    return `https://arweave.net/${transaction.id}`;
  } catch (error) {
    console.error("Error uploading to Arweave:", error);
    return null;
  }
};

export default uploadPfpToArweave;
