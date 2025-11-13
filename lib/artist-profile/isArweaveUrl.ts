export type ArweaveURL = `ar://${string}`;

export function isArweaveUrl(url: string | null | undefined): boolean {
  return url && typeof url === "string" ? url.startsWith("ar://") : false;
}
