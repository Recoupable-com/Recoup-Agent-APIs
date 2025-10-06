import { selectCatalogById } from "../supabase/catalogs/selectCatalogById";
import { selectAccountCatalogByAccountAndCatalog } from "../supabase/account_catalogs/selectAccountCatalogByAccountAndCatalog";
import { insertAccountCatalogs } from "../supabase/account_catalogs/insertAccountCatalogs";

/**
 * Links an existing catalog to an account
 */
export async function linkExistingCatalog(
  accountId: string,
  catalogId: string
): Promise<void> {
  await selectCatalogById(catalogId);
  const existingLink = await selectAccountCatalogByAccountAndCatalog(
    accountId,
    catalogId
  );

  if (existingLink) {
    // Relationship already exists, no need to create it
    return;
  }

  await insertAccountCatalogs([{ account: accountId, catalog: catalogId }]);
}
