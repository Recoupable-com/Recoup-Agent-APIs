import supabase from "../serverClient";
import { DeleteCatalogRequest } from "../../../controllers/CatalogsController";

/**
 * Deletes account_catalog relationships for the specified pairs
 */
export async function deleteAccountCatalogs(
  deleteRequests: DeleteCatalogRequest[]
): Promise<string[]> {
  const catalogIds = deleteRequests.map((req) => req.catalog_id);
  const accountIds = deleteRequests.map((req) => req.account_id);

  // Delete all matching relationships
  const { error } = await supabase
    .from("account_catalogs")
    .delete()
    .in("catalog", catalogIds)
    .in("account", accountIds);

  if (error) {
    throw new Error(`Failed to delete account_catalogs: ${error.message}`);
  }

  return catalogIds;
}
