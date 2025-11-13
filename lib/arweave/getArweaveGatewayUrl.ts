import type { ArweaveURL } from "../artist-profile/isArweaveUrl";

const ARWEAVE_GATEWAY = "https://arweave.net";

export default function getArweaveGatewayUrl(
  normalizedArweaveUrl: ArweaveURL | null
) {
  if (!normalizedArweaveUrl || typeof normalizedArweaveUrl !== "string")
    return null;
  return normalizedArweaveUrl.replace("ar://", `${ARWEAVE_GATEWAY}/`);
}
