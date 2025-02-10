import { ReadableStream } from "node:stream/web";
import getBlob from "../ipfs/getBlob";
import turboClient from "./client";

const uploadPfpToArweave = async (image: string): Promise<string | null> => {
  try {
    // Get image blob and type
    const { blob, type } = await getBlob(image);
    const avatarBlob = new Blob([blob], { type });
    const fileSize = avatarBlob.size;

    // Create a Web API ReadableStream factory directly from the blob
    const fileStreamFactory = () => {
      const stream = new Response(avatarBlob).body;
      if (!stream) throw new Error("Failed to create stream from blob");
      return stream as ReadableStream;
    };

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