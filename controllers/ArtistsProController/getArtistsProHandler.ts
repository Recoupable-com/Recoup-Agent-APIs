import { Request, Response } from "express";
import { getAllEnterpriseAccounts } from "@/lib/enterprise/getAllEnterpriseAccounts";
import { getSubscriberAccountEmails } from "@/lib/stripe/getSubscriberAccountEmails";

/**
 * Handles GET requests for artists list
 * Returns enterprise emails and account emails from active subscriptions
 */
export const getArtistsProHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const [allEnterpriseEmails, subscriptionAccountEmails] = await Promise.all([
      getAllEnterpriseAccounts(),
      getSubscriberAccountEmails(),
    ]);

    const artists = [...allEnterpriseEmails, ...subscriptionAccountEmails];

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
