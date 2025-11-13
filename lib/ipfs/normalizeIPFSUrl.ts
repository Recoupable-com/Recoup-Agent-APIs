import isNormalizedIPFSURL from "./isNormalizeableIPFSUrl";
import isCID from "./isCID";
import isIPFSUrl from "./isIPFSUrl";
import isGatewayIPFSUrl from "./isGatewayIPFSUrl";

export type IPFSUrl = `ipfs://${string}`;

export default function normalizeIPFSUrl(
  url: string | null | undefined
): IPFSUrl | null {
  if (!url || typeof url !== "string") return null;

  // Handle urls wrapped in quotes
  url = url.replace(/"/g, "");

  // Check if already a normalized IPFS url
  if (isNormalizedIPFSURL(url)) return url as IPFSUrl;

  // Check if url is a CID string
  if (isCID(url)) return `ipfs://${url}`;

  // If url is not either an ipfs gateway or protocol url
  if (!isIPFSUrl(url)) return null;

  // If url is already a gateway url, parse and normalize
  if (isGatewayIPFSUrl(url)) {
    // Replace leading double-slashes and parse URL
    const parsed = new URL(url.replace(/^\/\//, "http://"));
    // Remove IPFS from the URL
    // http://gateway/ipfs/<CID>?x=y#z -> http://gateway/<CID>?x=y#z
    parsed.pathname = parsed.pathname.replace(/^\/ipfs\//, "");
    // Remove the protocol and host from the URL
    // http://gateway/<CID>?x=y#z -> <CID>?x=y#z
    const cid = parsed
      .toString()
      .replace(`${parsed.protocol}//${parsed.host}/`, "");
    // Prepend ipfs protocol
    return `ipfs://${cid}`;
  }

  return null;
}
