import { CHAIN, PAYMASTER_URL } from "../consts";
import { http } from "viem";
import { createBundlerClient } from "viem/account-abstraction";

export const bundlerClient = createBundlerClient({
  chain: CHAIN,
  transport: http(PAYMASTER_URL),
});
