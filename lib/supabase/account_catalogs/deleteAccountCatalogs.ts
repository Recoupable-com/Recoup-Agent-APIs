import supabase from "../serverClient";
import { DeleteCatalogRequest } from "../../../controllers/CatalogsController";

/**
 * Deletes account_catalog relationships for the specified pairs
 */
export async function deleteAccountCatalogs(
  deleteRequests: DeleteCatalogRequest[]
): Promise<string[]> {
  // Delete each specific combination individually
  const deletePromises = deleteRequests.map(async (req) => {
    const { error } = await supabase
      .from("account_catalogs")
      .delete()
      .eq("catalog", req.catalog_id)
      .eq("account", req.account_id);

    if (error) {
      throw new Error(
        `Failed to delete account_catalog relationship: ${error.message}`
      );
    }

    return req.catalog_id;
  });

  const catalogIds = await Promise.all(deletePromises);
  return catalogIds;
}
