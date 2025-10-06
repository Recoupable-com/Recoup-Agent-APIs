import { linkExistingCatalog } from "./linkExistingCatalog.js";
import { createAndLinkNewCatalog } from "./createAndLinkNewCatalog.js";

type CatalogInput = {
  account_id: string;
  name?: string;
  catalog_id?: string;
};

/**
 * Processes a single catalog input according to the API behavior rules
 */
export async function processCatalogInput(
  catalogInput: CatalogInput
): Promise<void> {
  const { account_id, name, catalog_id } = catalogInput;

  if (!account_id) {
    throw new Error("account_id is required for each catalog");
  }

  if (catalog_id) {
    await linkExistingCatalog(account_id, catalog_id);
    return;
  }

  if (name) {
    await createAndLinkNewCatalog(account_id, name);
    return;
  }

  throw new Error("Either catalog_id or name must be provided");
}
