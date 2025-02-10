import { Readable } from "node:stream";
import getBlob from "../ipfs/getBlob";
import turboClient from "./client";

const uploadPfpToArweave = async (image: string): Promise<string | null> => {
  try {
    // Get image blob and type
    const { blob, type } = await getBlob(image);
    const avatarBlob = new Blob([blob], { type });
    const fileSize = avatarBlob.size;

    // Create a readable stream from the blob
    const fileStreamFactory = () => Readable.from(Buffer.from(await avatarBlob.arrayBuffer()));

    // Get upload costs
    const [{ winc: fileSizeCost }] = await turboClient.getUploadCosts({
      bytes: [fileSize],
    });

    // Upload the file with content type metadata
    const { id, dataCaches } = await turboClient.uploadFile({
      fileStreamFactory,
      fileSizeFactory: () => fileSize,
      dataItemOpts: {
        tags: [
          {
            name: "Content-Type",
            value: type || "image/png",
          },
          {
            name: "File-Name",
            value: "avatar.png",
          },
        ],
      },
    });

    if (!id) return null;

    // Return the Arweave URL
    return `https://arweave.net/${id}`;
  } catch (error) {
    console.error("Error uploading to Arweave:", error);
    return null;
  }
};

export default uploadPfpToArweave; 