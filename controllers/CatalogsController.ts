import { Request, Response } from "express";
import supabase from "../lib/supabase/serverClient";
import { Tables } from "../types/database.types";

type CatalogInput = {
  account_id: string;
  name?: string;
  catalog_id?: string;
};

type CreateCatalogsRequest = {
  catalogs: CatalogInput[];
};

type CatalogsResponse = {
  status: string;
  catalogs?: Tables<"catalogs">[];
  error?: string;
};

/**
 * Creates new catalogs or links existing catalogs to accounts.
 *
 * Behavior:
 * - If catalog_id is provided: links existing catalog to account
 * - If name is provided and catalog_id is omitted: creates new catalog then links it
 * - If both name and catalog_id are provided: catalog_id takes priority
 * - Returns the catalogs list for the specified account_id
 */
export const createCatalogsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const body = req.body as CreateCatalogsRequest;

    // Validate request body
    if (
      !body.catalogs ||
      !Array.isArray(body.catalogs) ||
      body.catalogs.length === 0
    ) {
      res.status(400).json({
        status: "error",
        error: "catalogs array is required and must not be empty",
      });
      return;
    }

    // Extract unique account_id from the first catalog (API docs suggest single account per request)
    const accountId = body.catalogs[0]?.account_id;
    if (!accountId) {
      res.status(400).json({
        status: "error",
        error: "account_id is required",
      });
      return;
    }

    // Verify all catalogs have the same account_id
    const allSameAccount = body.catalogs.every(
      (catalog) => catalog.account_id === accountId
    );
    if (!allSameAccount) {
      res.status(400).json({
        status: "error",
        error: "All catalogs must have the same account_id",
      });
      return;
    }

    // Process each catalog
    for (const catalogInput of body.catalogs) {
      await processCatalogInput(catalogInput);
    }

    // Return the updated catalogs list for the account
    const response = await getCatalogsForAccount(accountId);
    res.json(response);
  } catch (error) {
    console.error("Error creating catalogs:", error);
    res.status(500).json({
      status: "error",
      error: "Internal server error",
    });
  }
};

/**
 * Processes a single catalog input according to the API behavior rules
 */
async function processCatalogInput(catalogInput: CatalogInput): Promise<void> {
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

/**
 * Links an existing catalog to an account
 */
async function linkExistingCatalog(
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

/**
 * Creates a new catalog and links it to an account
 */
async function createAndLinkNewCatalog(
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

/**
 * Retrieves all catalogs for a specific account
 */
async function getCatalogsForAccount(
  accountId: string
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
    .eq("account", accountId)
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
