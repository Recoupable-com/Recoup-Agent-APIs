import { Coinbase } from "@coinbase/coinbase-sdk";

const apiKeyName = process.env.CDP_API_KEY_ID;
const privateKey = process.env.CDP_API_KEY_SECRET;

if (!apiKeyName || !privateKey) {
  throw new Error("CDP_API_KEY_ID and CDP_API_KEY_SECRET must be set");
}

/**
 * Initializes the Coinbase SDK with credentials from environment variables
 */
export const initCoinbaseSdk = () =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  Coinbase.configure({
    apiKeyName: apiKeyName,
    privateKey: privateKey,
  });
