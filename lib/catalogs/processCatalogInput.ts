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

  // Validate required fields
  if (!account_id) {
    throw new Error("account_id is required for each catalog");
  }

  // If catalog_id is provided, link existing catalog (takes priority)
  if (catalog_id) {
    await linkExistingCatalog(account_id, catalog_id);
  }
  // If name is provided and catalog_id is omitted, create new catalog
  else if (name) {
    await createAndLinkNewCatalog(account_id, name);
  }
  // If neither is provided, it's an invalid input
  else {
    throw new Error("Either catalog_id or name must be provided");
  }
}
