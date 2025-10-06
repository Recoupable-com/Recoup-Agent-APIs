import supabase from "../supabase/serverClient";

/**
 * Creates a new catalog and links it to an account
 */
export async function createAndLinkNewCatalog(
  accountId: string,
  catalogName: string
): Promise<void> {
  // Create the new catalog
  const { data: newCatalog, error: createError } = await supabase
    .from("catalogs")
    .insert({
      name: catalogName,
    })
    .select()
    .single();

  if (createError || !newCatalog) {
    throw new Error(
      `Failed to create catalog: ${createError?.message || "Unknown error"}`
    );
  }

  // Link the new catalog to the account
  const { error: linkError } = await supabase.from("account_catalogs").insert({
    account: accountId,
    catalog: newCatalog.id,
  });

  if (linkError) {
    throw new Error(`Failed to link new catalog: ${linkError.message}`);
  }
}
