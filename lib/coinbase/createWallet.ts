import {
  type SmartWallet,
  createSmartWallet as createCoinbaseSmartWallet,
} from "@coinbase/coinbase-sdk";
import type { Address } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export interface SmartWalletResult {
  address: Address;
  wallet: SmartWallet;
}

/**
 * Creates a new smart wallet for batch signing transactions
 * @returns Promise resolving to the smart wallet address and instance
 */
export async function createSmartWallet(): Promise<SmartWalletResult> {
  try {
    const privateKey = generatePrivateKey();
    const owner = privateKeyToAccount(privateKey);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const smartWallet = await createCoinbaseSmartWallet({
      signer: owner,
    });

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      address: smartWallet.address,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      wallet: smartWallet,
    };
  } catch (error) {
    console.error("[createSmartWallet] Error:", error);
    throw new Error("Failed to create smart wallet");
  }
}
