import isNormalizedIPFSURL from "./isNormalizeableIPFSUrl";

export default function isGatewayIPFSUrl(
  url: string | null | undefined
): boolean {
  if (url && typeof url === "string") {
    try {
      const parsed = new URL(url.replace(/^"|'(.*)"|'$/, "$1"));
      return (
        !isNormalizedIPFSURL(url) &&
        parsed &&
        parsed.pathname.startsWith("/ipfs/")
      );
    } catch {
      return false;
    }
  }

  return false;
}
