import supabase from "../serverClient";
import { Tables } from "../../../types/database.types";

/**
 * Selects a catalog by its ID
 */
export async function selectCatalogById(
  catalogId: string
): Promise<Tables<"catalogs">> {
  const { data: catalog, error } = await supabase
    .from("catalogs")
    .select()
    .eq("id", catalogId)
    .single();

  if (error || !catalog) {
    throw new Error(`Catalog with ID ${catalogId} not found`);
  }

  return catalog;
}
