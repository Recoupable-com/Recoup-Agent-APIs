import { Request, Response } from "express";
import { getAllEnterpriseAccounts } from "@/lib/enterprise/getAllEnterpriseAccounts";

/**
 * Handles GET requests for artists list
 * Returns enterprise emails
 */
export const getArtistsProHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allEnterpriseEmails = await getAllEnterpriseAccounts();

    res.status(200).json({
      status: "success",
      artists: allEnterpriseEmails,
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
