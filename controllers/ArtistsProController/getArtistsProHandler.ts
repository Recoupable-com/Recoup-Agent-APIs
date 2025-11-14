import { Request, Response } from "express";
import { getAllEnterpriseAccounts } from "@/lib/enterprise/getAllEnterpriseAccounts";
import { getActiveSubscriptions } from "@/lib/stripe/getActiveSubscriptions";
import { getAccountEmails } from "@/lib/supabase/account_emails/getAccountEmails";
import Stripe from "stripe";

/**
 * Handles GET requests for artists list
 * Returns enterprise emails and account emails from active subscriptions
 */
export const getArtistsProHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allEnterpriseEmails = await getAllEnterpriseAccounts();
    const activeSubscriptions = await getActiveSubscriptions();

    // Extract accountIds from subscription metadata
    const accountIds = activeSubscriptions
      .map(
        (subscription: Stripe.Subscription) => subscription.metadata?.accountId
      )
      .filter((accountId: string | undefined): accountId is string =>
        Boolean(accountId)
      );

    // Get account emails for subscriptions with accountIds
    const subscriptionAccountEmails =
      accountIds.length > 0
        ? await getAccountEmails({ account_ids: accountIds })
        : [];

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
