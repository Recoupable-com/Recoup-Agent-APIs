import { insertCatalogs } from "../supabase/catalogs/insertCatalogs";
import { insertAccountCatalogs } from "../supabase/account_catalogs/insertAccountCatalogs";

/**
 * Creates a new catalog and links it to an account
 */
export async function createAndLinkNewCatalog(
  accountId: string,
  catalogName: string
): Promise<void> {
  const newCatalogs = await insertCatalogs([{ name: catalogName }]);

  if (!newCatalogs || newCatalogs.length === 0) {
    throw new Error("Failed to create catalog: No catalog was created");
  }

  const newCatalog = newCatalogs[0];

  await insertAccountCatalogs([{ account: accountId, catalog: newCatalog.id }]);
}
