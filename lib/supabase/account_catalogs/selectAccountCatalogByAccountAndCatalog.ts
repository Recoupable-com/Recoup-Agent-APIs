import supabase from "../serverClient";
import { Tables } from "../../../types/database.types";

/**
 * Selects an account_catalog relationship by account ID and catalog ID
 */
export async function selectAccountCatalogByAccountAndCatalog(
  accountId: string,
  catalogId: string
): Promise<Tables<"account_catalogs"> | null> {
  const { data: existingLink } = await supabase
    .from("account_catalogs")
    .select()
    .eq("account", accountId)
    .eq("catalog", catalogId)
    .single();

  return existingLink;
}
