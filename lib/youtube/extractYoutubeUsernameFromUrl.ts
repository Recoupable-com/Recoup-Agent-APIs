export const extractYoutubeUsernameFromUrl = (
  url?: string | null
): string | undefined => {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.replace(/^\/+/, "");

    if (!pathname) return undefined;

    if (pathname.startsWith("@")) {
      return pathname.slice(1);
    }

    const segments = pathname.split("/");
    return segments[segments.length - 1] || undefined;
  } catch {
    return undefined;
  }
};
