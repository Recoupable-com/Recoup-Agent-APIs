import supabase from "../supabase/serverClient";

/**
 * Links an existing catalog to an account
 */
export async function linkExistingCatalog(
  accountId: string,
  catalogId: string
): Promise<void> {
  // First verify the catalog exists
  const { data: catalog, error: catalogError } = await supabase
    .from("catalogs")
    .select("id")
    .eq("id", catalogId)
    .single();

  if (catalogError || !catalog) {
    throw new Error(`Catalog with ID ${catalogId} not found`);
  }

  // Check if the relationship already exists
  const { data: existingLink } = await supabase
    .from("account_catalogs")
    .select("id")
    .eq("account", accountId)
    .eq("catalog", catalogId)
    .single();

  if (existingLink) {
    // Relationship already exists, no need to create it
    return;
  }

  // Create the relationship
  const { error: linkError } = await supabase.from("account_catalogs").insert({
    account: accountId,
    catalog: catalogId,
  });

  if (linkError) {
    throw new Error(`Failed to link catalog: ${linkError.message}`);
  }
}
