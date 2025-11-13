import isNormalizedIPFSURL from "./isNormalizeableIPFSUrl";
import isGatewayIPFSUrl from "./isGatewayIPFSUrl";

export default function isIPFSUrl(url: string | null | undefined): boolean {
  return url ? isNormalizedIPFSURL(url) || isGatewayIPFSUrl(url) : false;
}
