function isNormalizedIPFSURL(url: string | null | undefined): boolean {
  return url && typeof url === "string" ? url.startsWith("ipfs://") : false;
}

export default isNormalizedIPFSURL;
