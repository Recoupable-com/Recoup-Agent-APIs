import supabase from "../supabase/serverClient";
import { Tables } from "../../types/database.types";

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
    throw new Error(`Failed to fetch catalogs: ${error.message}`);
  }

  // Transform the nested data structure
  const catalogs: Tables<"catalogs">[] =
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
