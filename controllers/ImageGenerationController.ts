import { Request, Response } from "express";
import { generateImage } from "../lib/openai/generateImage";
import getAccountSocials from "../lib/supabase/getAccountSocials";
import { createContract } from "../lib/inprocess/createContract";
import uploadToArweave from "../lib/arweave/uploadToArweave";

/**
 * Validates the artist account exists in the database
 */
const validateArtistAccount = async (
  artistAccountId: string
): Promise<boolean> => {
  const { status } = await getAccountSocials(artistAccountId);
  return status === "success";
};

/**
 * Handles image generation requests
 */
export const generateImageHandler = async (
  req: Request<{}, {}, {}, { prompt?: string; artist_account_id?: string }>,
  res: Response
) => {
  try {
    const { prompt, artist_account_id } = req.query;

    // Validate required parameters
    if (!prompt?.trim()) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "invalid_prompt",
          message: "The provided prompt is invalid or empty",
        },
      });
    }

    if (!artist_account_id?.trim()) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "invalid_artist",
          message: "The provided artist_account_id is invalid or empty",
        },
      });
    }

    // Validate artist exists
    const isValidArtist = await validateArtistAccount(artist_account_id);
    if (!isValidArtist) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "invalid_artist",
          message: "The provided artist_account_id was not found",
        },
      });
    }

    // Generate image
    const result = await generateImage(prompt);

    if (!result.data[0].b64_json) {
      return res.status(500).json({
        status: "error",
        error: {
          code: "image_generation_failed",
          message: "Failed to generate the image",
        },
      });
    }
    // Upload to Arweave
    const transaction = await uploadToArweave({
      base64Data: result.data[0].b64_json,
      mimeType: "image/png",
    });

    const arweaveUrl = `https://arweave.net/${transaction.id}`;

    if (!arweaveUrl) {
      return res.status(500).json({
        status: "error",
        error: {
          code: "storage_failed",
          message: "Failed to store the image on Arweave",
        },
      });
    }

    // Create contract for the image
    console.log("[ImageGeneration] Creating contract...");
    const contractResult = await createContract({
      imageUrl: arweaveUrl,
    });

    // Return successful response with Arweave URL following API spec
    return res.status(200).json({
      status: "success",
      data: {
        image_url: arweaveUrl,
        post_id: contractResult.contractAddress,
        artist_id: artist_account_id,
        created_at: contractResult.createdAt,
      },
    });
  } catch (error) {
    console.error("[ImageGeneration] Error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return res.status(429).json({
          status: "error",
          error: {
            code: "rate_limit_exceeded",
            message: "You have exceeded the rate limit for image generation",
          },
        });
      }
    }

    // Generic error response
    return res.status(500).json({
      status: "error",
      error: {
        code: "generation_failed",
        message: "The image generation process failed",
      },
    });
  }
};
