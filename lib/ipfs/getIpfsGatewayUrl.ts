import normalizeIPFSUrl from "./normalizeIPFSUrl";

const IPFS_GATEWAY = "https://magic.decentralized-content.com";

export default function getIpfsGatewayUrl(
  url: string | null | undefined
): string | null {
  if (!url || typeof url !== "string") return null;

  const normalizedIPFSUrl = normalizeIPFSUrl(url);
  if (!normalizedIPFSUrl) return null;

  return normalizedIPFSUrl.replace("ipfs://", `${IPFS_GATEWAY}/ipfs/`);
}
