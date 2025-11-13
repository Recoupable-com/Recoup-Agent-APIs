import type { ArweaveURL } from "../artist-profile/isArweaveUrl";
import { isArweaveUrl } from "../artist-profile/isArweaveUrl";
import getArweaveGatewayUrl from "./getArweaveGatewayUrl";

export function getFetchableUrl(uri: string | null | undefined): string | null {
  if (!uri || typeof uri !== "string") return null;

  // Prevent fetching from insecure URLs
  if (uri.startsWith("http://")) return null;

  // If it is a ar:// url
  if (isArweaveUrl(uri)) {
    // Return a fetchable gateway url
    return getArweaveGatewayUrl(uri as ArweaveURL);
  }

  // If it is already a url (or blob or data-uri)
  if (/^(https|data|blob):/.test(uri)) {
    // Return the URI
    return uri;
  }

  return null;
}
