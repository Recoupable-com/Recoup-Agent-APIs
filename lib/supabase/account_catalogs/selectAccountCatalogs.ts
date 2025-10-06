import supabase from "../serverClient";
import { Tables } from "../../../types/database.types";

type AccountCatalogWithCatalog = {
  catalog: string;
  catalogs: Tables<"catalogs">[];
};

/**
 * Selects account_catalogs with related catalog data for multiple accounts
 */
export async function selectAccountCatalogs(
  accountIds: string[]
): Promise<AccountCatalogWithCatalog[]> {
  const { data, error } = await supabase
    .from("account_catalogs")
    .select(
      `
      catalog,
      catalogs!inner (
        id,
        name,
        created_at,
        updated_at
      )
    `
    )
    .in("account", accountIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch account_catalogs: ${error.message}`);
  }

  return data || [];
}
