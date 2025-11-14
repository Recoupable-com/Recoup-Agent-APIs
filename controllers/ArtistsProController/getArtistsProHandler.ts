import { Request, Response } from "express";
import { getEnterpriseArtists } from "@/lib/enterprise/getEnterpriseArtists";

/**
 * Handles GET requests for artists list
 * Returns artists associated with pro accounts (enterprise and active subscriptions)
 */
export const getArtistsProHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const artists = await getEnterpriseArtists();

    res.status(200).json({
      status: "success",
      artists,
    });
  } catch (error) {
    console.error("[ERROR] Error in getArtistsProHandler:", error);
    res.status(500).json({
      status: "error",
      artists: [],
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};
