import { Database } from "../../types/database.types";

type SocialType = Database["public"]["Enums"]["social_type"];

/**
 * Generates a platform-specific profile URL based on the platform type and handle
 * @param platform The social media platform
 * @param handle The user handle/username (without @ symbol)
 * @returns The complete profile URL for the given platform
 * @throws Error if platform is not supported
 */
export function getProfileUrl(platform: SocialType, handle: string): string {
  // Remove @ symbol if present
  const cleanHandle = handle.replace(/^@/, "");

  switch (platform) {
    case "INSTAGRAM":
      return `https://instagram.com/${cleanHandle}`;
    case "TIKTOK":
      return `https://tiktok.com/@${cleanHandle}`;
    case "TWITTER":
      return `https://x.com/${cleanHandle}`;
    case "SPOTIFY":
      // For Spotify, handle is expected to be the artist ID
      return `https://open.spotify.com/artist/${cleanHandle}`;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
