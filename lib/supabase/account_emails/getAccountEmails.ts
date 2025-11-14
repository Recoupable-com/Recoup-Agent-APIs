import serverClient from "../serverClient";
import { Tables } from "../../../types/database.types";

type AccountEmail = Tables<"account_emails">;

type GetAccountEmailsParams = {
  account_id?: string;
  queryEmail?: string;
};

/**
 * Selects account_emails with optional filters
 */
export const getAccountEmails = async (
  params: GetAccountEmailsParams
): Promise<AccountEmail[]> => {
  let query = serverClient.from("account_emails").select("*");

  // Add filters based on provided parameters
  if (params.account_id) {
    query = query.eq("account_id", params.account_id);
  }

  if (params.queryEmail) {
    query = query.ilike("email", `%${params.queryEmail}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching account emails:", error);
    throw error;
  }

  return data || [];
};
