import supabase from "../serverClient";
import { Tables } from "../../../types/database.types";

type AccountCatalogWithCatalog = {
  catalog: string;
  catalogs: Tables<"catalogs">[];
};

type SelectAccountCatalogsParams = {
  accountIds?: string[];
  catalogIds?: string[];
};

/**
 * Selects account_catalogs with optional related catalog data
 */
export async function selectAccountCatalogs(
  params: SelectAccountCatalogsParams
): Promise<AccountCatalogWithCatalog[]> {
  let query = supabase
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
    .order("created_at", { ascending: false });

  // Add filters based on provided parameters
  if (params.accountIds && params.accountIds.length > 0) {
    query = query.in("account", params.accountIds);
  }

  if (params.catalogIds && params.catalogIds.length > 0) {
    query = query.in("catalog", params.catalogIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch account_catalogs: ${error.message}`);
  }

  return data || [];
}
