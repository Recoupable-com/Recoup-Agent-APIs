import { Request, Response } from "express";
import { getActiveSubscriptionDetails } from "../lib/stripe/getActiveSubscriptionDetails";
import isEnterprise from "../lib/isEnterprise";
import { getAccountEmails } from "../lib/supabase/account_emails/getAccountEmails";

/**
 * Retrieves subscription information for an account.
 * For enterprise accounts, returns a simplified response.
 * For standard accounts, returns the full Stripe subscription object.
 */
export const getSubscriptionsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { accountId } = req.query;

    // Validate required parameter
    if (!accountId || typeof accountId !== "string") {
      res.status(400).json({
        status: "error",
        error: "accountId parameter is required",
      });
      return;
    }

    // Get account emails to check if any belong to enterprise domain
    const accountEmails = await getAccountEmails({ account_id: accountId });

    if (!accountEmails || accountEmails.length === 0) {
      res.status(404).json({
        status: "error",
        error: "Account not found",
      });
      return;
    }

    // Check if any account email belongs to enterprise domain
    const isAccountEnterprise = accountEmails.some((emailRecord) =>
      isEnterprise(emailRecord.email || "")
    );

    if (isAccountEnterprise) {
      res.json({
        status: "success",
        isEnterprise: true,
      });
      return;
    }

    // Get subscription details for standard accounts
    const subscription = await getActiveSubscriptionDetails(accountId);

    if (!subscription) {
      res.status(404).json({
        status: "error",
        error: "No active subscription found",
      });
      return;
    }

    res.json({
      status: "success",
      subscription,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      status: "error",
      error: "Internal server error",
    });
  }
};
