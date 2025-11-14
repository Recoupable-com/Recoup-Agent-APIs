import { getActiveSubscriptions } from "./getActiveSubscriptions";
import { getAccountEmails } from "@/lib/supabase/account_emails/getAccountEmails";
import Stripe from "stripe";
import { Tables } from "@/types/database.types";

type AccountEmail = Tables<"account_emails">;

/**
 * Gets account emails for all active subscriptions
 * Extracts accountIds from subscription metadata and fetches corresponding account emails
 * @returns Array of account emails from active subscriptions
 */
export const getSubscriberAccountEmails = async (): Promise<AccountEmail[]> => {
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
  if (accountIds.length === 0) {
    return [];
  }

  return await getAccountEmails({ account_ids: accountIds });
};
