/**
 * Extracts the platform name from a social media URL
 * @param url The URL to analyze
 * @returns The platform name (Instagram, Twitter, TikTok, Spotify) or "Unknown"
 */
export const getPlatformFromUrl = (url: string): string => {
  if (url.includes("instagram.com")) return "Instagram";
  if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter";
  if (url.includes("tiktok.com")) return "TikTok";
  if (url.includes("spotify.com")) return "Spotify";
  return "Unknown";
};

export default getPlatformFromUrl;
