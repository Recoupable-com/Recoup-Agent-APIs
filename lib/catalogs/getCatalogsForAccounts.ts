import { Tables } from "../../types/database.types";
import { selectAccountCatalogs } from "../supabase/account_catalogs/selectAccountCatalogs";

type CatalogsResponse = {
  status: string;
  catalogs?: Tables<"catalogs">[];
  error?: string;
};

/**
 * Retrieves all catalogs for multiple accounts
 */
export async function getCatalogsForAccounts(
  accountIds: string[]
): Promise<CatalogsResponse> {
  const data = await selectAccountCatalogs({
    accountIds,
  });

  // Transform the nested data structure
  const catalogs =
    data?.map((item: any) => ({
      id: item.catalogs.id,
      name: item.catalogs.name,
      created_at: item.catalogs.created_at,
      updated_at: item.catalogs.updated_at,
    })) || [];

  return {
    status: "success",
    catalogs,
  };
}
