import { Database } from "../../types/database.types";

type SocialType = Database["public"]["Enums"]["social_type"];

/**
 * Normalizes a platform name to the standard uppercase format used in the database
 * @param platform The platform name to normalize
 * @returns The normalized platform name
 */
export function normalizePlatform(platform: string): SocialType {
  return platform.toUpperCase() as SocialType;
}
