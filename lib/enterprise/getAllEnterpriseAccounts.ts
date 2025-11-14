import { getAccountEmails } from "@/lib/supabase/account_emails/getAccountEmails";
import { ENTERPRISE_DOMAINS } from "@/lib/consts";
import { Tables } from "@/types/database.types";

type AccountEmail = Tables<"account_emails">;

/**
 * Gets all account emails that belong to enterprise domains
 * @returns Array of account emails from enterprise domains
 */
export const getAllEnterpriseAccounts = async (): Promise<AccountEmail[]> => {
  const allEnterpriseEmails: AccountEmail[] = [];

  // Query for each enterprise domain using queryEmail parameter
  for (const domain of ENTERPRISE_DOMAINS) {
    const emails = await getAccountEmails({ queryEmail: `@${domain}` });
    allEnterpriseEmails.push(...emails);
  }

  return allEnterpriseEmails;
};
