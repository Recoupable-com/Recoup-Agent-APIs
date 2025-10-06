import { deleteAccountCatalogs } from "../supabase/account_catalogs/deleteAccountCatalogs";
import { selectAccountCatalogs } from "../supabase/account_catalogs/selectAccountCatalogs";
import { deleteCatalogs } from "../supabase/catalogs/deleteCatalogs";
import { DeleteCatalogRequest } from "../../controllers/CatalogsController";

/**
 * Deletes catalog-account relationships and cleans up orphaned catalogs
 */
export async function deleteCatalogsForAccounts(
  deleteRequests: DeleteCatalogRequest[]
): Promise<void> {
  // Validate all requests have required fields
  const invalidRequests = deleteRequests.filter(
    (req) => !req.catalog_id || !req.account_id
  );

  if (invalidRequests.length > 0) {
    throw new Error(
      "Both catalog_id and account_id are required for each delete request"
    );
  }

  // Delete the account_catalog relationships
  const affectedCatalogIds = await deleteAccountCatalogs(deleteRequests);

  // Check which catalogs still have remaining relationships
  const remainingData = await selectAccountCatalogs({
    catalogIds: affectedCatalogIds,
  });
  const remainingCatalogIds = remainingData.map((item) => item.catalog);

  // Identify orphaned catalogs (those with no remaining relationships)
  const orphanedCatalogIds = affectedCatalogIds.filter(
    (id) => !remainingCatalogIds.includes(id)
  );

  // Delete orphaned catalogs (this will cascade to catalog_songs)
  if (orphanedCatalogIds.length > 0) {
    await deleteCatalogs(orphanedCatalogIds);
  }
}
