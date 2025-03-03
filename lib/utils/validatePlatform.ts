import { SocialType } from "../../types/agent";

/**
 * Type guard to check if a platform string is a valid SocialType
 *
 * @param platform - The platform string to validate
 * @returns True if the platform is a valid SocialType, false otherwise
 *
 * @example
 * ```typescript
 * const platform = getSocialPlatformByLink(url);
 * if (isValidPlatform(platform)) {
 *   // platform is now typed as SocialType
 *   const profileUrl = getProfileUrl(platform, username);
 * }
 * ```
 */
export function isValidPlatform(
  platform: string | null
): platform is SocialType {
  if (!platform) {
    console.warn("Platform is null or undefined");
    return false;
  }

  if (platform === "NONE" || platform === "APPPLE") {
    console.warn(`Invalid platform value: ${platform}`);
    return false;
  }

  // Add explicit check against known valid platforms
  const validPlatforms = ["INSTAGRAM", "TIKTOK", "TWITTER", "SPOTIFY"];
  if (!validPlatforms.includes(platform)) {
    console.warn(`Unknown platform: ${platform}`);
    return false;
  }

  return true;
}

export default isValidPlatform;
