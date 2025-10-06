import { Request, Response } from "express";
import { processCatalogInput } from "../lib/catalogs/processCatalogInput";
import { getCatalogsForAccounts } from "../lib/catalogs/getCatalogsForAccounts";
import { deleteCatalogsForAccounts } from "../lib/catalogs/deleteCatalogsForAccounts";

type CatalogInput = {
  account_id: string;
  name?: string;
  catalog_id?: string;
};

type CreateCatalogsRequest = {
  catalogs: CatalogInput[];
};

export type DeleteCatalogRequest = {
  catalog_id: string;
  account_id: string;
};

type DeleteCatalogsRequest = {
  catalogs: DeleteCatalogRequest[];
};

/**
 * Retrieves all catalogs associated with a specific account.
 */
export const getCatalogsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { account_id } = req.query;

    if (!account_id || typeof account_id !== "string") {
      res.status(400).json({
        status: "error",
        error: "account_id parameter is required",
      });
      return;
    }

    // Get catalogs for the specified account
    const response = await getCatalogsForAccounts([account_id]);
    res.json(response);
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
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

    // Verify all catalogs have an account_id
    const catalogsWithoutAccountId = body.catalogs.filter(
      (catalog) => !catalog.account_id
    );
    if (catalogsWithoutAccountId.length > 0) {
      res.status(400).json({
        status: "error",
        error: "account_id is required for each catalog",
      });
      return;
    }

    // Process each catalog
    for (const catalogInput of body.catalogs) {
      await processCatalogInput(catalogInput);
    }

    // Get unique account IDs from the processed catalogs
    const uniqueAccountIds = [
      ...new Set(body.catalogs.map((catalog) => catalog.account_id)),
    ];

    // Return the updated catalogs list for all accounts
    const response = await getCatalogsForAccounts(uniqueAccountIds);
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
 * Deletes catalog-account relationships and cleans up orphaned catalogs.
 *
 * Behavior:
 * - Removes the relationship in account_catalogs for each {catalog_id, account_id} pair
 * - After removal, if no account_catalogs records remain for a catalog_id, the catalog is deleted from catalogs (cascades delete of related catalog_songs)
 * - If other account_catalogs records remain for a catalog_id, only the relationship is removed; the catalog remains for other accounts
 * - If either catalog_id or account_id is missing in any item, an error is returned
 */
export const deleteCatalogsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const body = req.body as DeleteCatalogsRequest;

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

    // Validate all delete requests have required fields
    const invalidRequests = body.catalogs.filter(
      (catalog) => !catalog.catalog_id || !catalog.account_id
    );
    if (invalidRequests.length > 0) {
      res.status(400).json({
        status: "error",
        error: "Both catalog_id and account_id are required for each catalog",
      });
      return;
    }

    // Delete catalog-account relationships and clean up orphaned catalogs
    await deleteCatalogsForAccounts(body.catalogs);

    res.json({
      status: "success",
      message: "Catalogs deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting catalogs:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
