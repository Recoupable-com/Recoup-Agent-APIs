import { Readable } from "node:stream";
import getBlob from "../ipfs/getBlob";
import turboClient from "./client";

const uploadPfpToArweave = async (image: string): Promise<string | null> => {
  try {
    // Get image blob and type
    const { blob, type } = await getBlob(image);
    const buffer = Buffer.from(await blob.arrayBuffer());
    const fileSize = buffer.length;

    // Create a Node.js Readable stream factory
    const fileStreamFactory = () => {
      const stream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });
      return stream;
    };

    const { id } = await turboClient.uploadFile({
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

    return `https://arweave.net/${id}`;
  } catch (error) {
    console.error("Error uploading to Arweave:", error);
    return null;
  }
};

export default uploadPfpToArweave;
