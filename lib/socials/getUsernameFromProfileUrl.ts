/**
 * Extracts username from a profile URL by pulling text after .com/ or .net/ until ? or /
 * @param profileUrl - The profile URL to extract username from
 * @returns The username or null if unable to extract
 */
export const getUsernameFromProfileUrl = (
  profileUrl: string | null | undefined
): string => {
  if (!profileUrl) {
    return "";
  }

  try {
    const normalizedUrl = profileUrl.toLowerCase().trim();
    const match = normalizedUrl.match(/(?:\.com|\.net)\/([^/?]+)/);
    return match ? match[1] : "";
  } catch (error) {
    console.error("[ERROR] Error extracting username from profile URL:", error);
    return "";
  }
};
