import { getAllEnterpriseAccounts } from "@/lib/enterprise/getAllEnterpriseAccounts";
import { getSubscriberAccountEmails } from "@/lib/stripe/getSubscriberAccountEmails";
import { selectAccountArtistIds } from "@/lib/supabase/account_artist_ids/selectAccountArtistIds";
import { Tables } from "@/types/database.types";

type AccountArtistId = Tables<"account_artist_ids">;

/**
 * Gets all artists associated with pro accounts (enterprise and active subscriptions)
 * @returns Array of account_artist_ids records for pro accounts
 */
export const getEnterpriseArtists = async (): Promise<AccountArtistId[]> => {
  const [allEnterpriseEmails, subscriptionAccountEmails] = await Promise.all([
    getAllEnterpriseAccounts(),
    getSubscriberAccountEmails(),
  ]);

  // Extract unique account_ids from enterprise emails and subscription account emails
  const allAccountEmails = [
    ...allEnterpriseEmails,
    ...subscriptionAccountEmails,
  ];
  const accountIds = new Set<string>();
  allAccountEmails.forEach((email) => {
    if (email.account_id) {
      accountIds.add(email.account_id);
    }
  });

  // Get all artists associated with pro accounts
  if (accountIds.size === 0) {
    return [];
  }

  return await selectAccountArtistIds({ account_ids: Array.from(accountIds) });
};
