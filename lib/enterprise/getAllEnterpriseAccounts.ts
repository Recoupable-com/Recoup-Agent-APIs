import { getAccountEmails } from "@/lib/supabase/account_emails/getAccountEmails";
import { ENTERPRISE_DOMAINS } from "@/lib/consts";
import { Tables } from "@/types/database.types";

type AccountEmail = Tables<"account_emails">;

/**
 * Gets all account emails that belong to enterprise domains
 * @returns Array of account emails from enterprise domains
 */
export const getAllEnterpriseAccounts = async (): Promise<AccountEmail[]> => {
  // Query for each enterprise domain using queryEmail parameter in parallel
  const emailPromises = Array.from(ENTERPRISE_DOMAINS).map((domain) =>
    getAccountEmails({ queryEmail: `@${domain}` })
  );

  const emailArrays = await Promise.all(emailPromises);

  // Flatten the array of arrays into a single array
  return emailArrays.flat();
};
