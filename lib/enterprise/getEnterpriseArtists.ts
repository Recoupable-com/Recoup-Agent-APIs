import { getAllEnterpriseAccounts } from "@/lib/enterprise/getAllEnterpriseAccounts";
import { getSubscriberAccountEmails } from "@/lib/stripe/getSubscriberAccountEmails";
import { selectAccountArtistIds } from "@/lib/supabase/account_artist_ids/selectAccountArtistIds";

/**
 * Gets all artists associated with pro accounts (enterprise and active subscriptions)
 * @returns Array of unique artist_ids for pro accounts
 */
export const getEnterpriseArtists = async (): Promise<string[]> => {
  const [allEnterpriseEmails, subscriptionAccountEmails] = await Promise.all([
    getAllEnterpriseAccounts(),
    getSubscriberAccountEmails(),
  ]);

  // Extract unique account_ids from enterprise emails and subscription account emails
  const accountIds = new Set(
    [...allEnterpriseEmails, ...subscriptionAccountEmails]
      .map((email) => email.account_id)
      .filter((id): id is string => Boolean(id))
  );

  if (accountIds.size === 0) {
    return [];
  }

  // Get artist_ids and deduplicate using Set
  const accountArtistIds = await selectAccountArtistIds({
    account_ids: Array.from(accountIds),
  });

  return Array.from(
    new Set(
      accountArtistIds
        .map((record) => record.artist_id)
        .filter((id): id is string => Boolean(id))
    )
  );
};
