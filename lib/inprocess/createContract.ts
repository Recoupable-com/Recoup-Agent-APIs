import { initCoinbaseSdk } from "../coinbase/client";
import { createSmartWallet } from "../coinbase/createWallet";
import { CHAIN, PAYMASTER_URL, IN_PROCESS_FACTORY_ADDRESS } from "../consts";
import { collectibleFactoryAbi } from "../abi/collectibleFactoryAbi";
import type { Address, Hash } from "viem";
import { waitForUserOperation } from "@coinbase/coinbase-sdk";
import { bundlerClient } from "../viem/client";

/**
 * Input parameters for creating an image contract
 */
interface CreateImageContractParams {
  imageUrl: string; // Arweave URL of the image
}

/**
 * Response from contract creation
 */
interface CreateImageContractResult {
  contractAddress: Address;
  transactionHash: Hash;
  smartWalletAddress: Address;
  createdAt: string;
}

/**
 * Creates a new NFT contract for generated images using Zora's Creator Factory
 * Handles SDK initialization and smart wallet creation internally
 * @param params Image and artist details for contract creation
 * @returns Promise resolving to contract address and transaction details
 */
export async function createContract({
  imageUrl,
}: CreateImageContractParams): Promise<CreateImageContractResult> {
  try {
    initCoinbaseSdk();

    const { wallet: smartWallet, address: smartWalletAddress } =
      await createSmartWallet();

    const contractURI = imageUrl;
    const createdAt = new Date().toISOString();
    const name = `AI Generated Image - ${new Date(createdAt).toLocaleDateString()}`;

    const defaultRoyaltyConfig = {
      royaltyMintSchedule: 0,
      royaltyBPS: 500, // 5%
      royaltyRecipient: smartWalletAddress,
    } as const;

    const createContractCall = {
      abi: collectibleFactoryAbi,
      functionName: "createContract" as const,
      args: [
        contractURI,
        name,
        defaultRoyaltyConfig,
        smartWalletAddress,
        [] as const,
      ] as const,
      to: IN_PROCESS_FACTORY_ADDRESS,
    } as const;

    const userOperation = await smartWallet.sendUserOperation({
      calls: [createContractCall],
      chainId: CHAIN.id,
      paymasterUrl: PAYMASTER_URL,
    });

    const userOperationResult = await waitForUserOperation(userOperation);
    const hash = userOperationResult.userOpHash;
    const receipt = await bundlerClient.getUserOperationReceipt({
      hash,
    });

    console.log("[createContract] Receipt logs:", receipt.logs);

    // Event signature for contract creation from the logs
    const CONTRACT_CREATED_EVENT =
      "0xa45800684f65ae010ceb4385eceaed88dec7f6a6bcbe11f7ffd8bd24dd2653f4";

    const setupEvent = receipt.logs.find(
      (log: { topics: string[] }) => log.topics[0] === CONTRACT_CREATED_EVENT
    );

    console.log("[createContract] Setup event:", setupEvent);

    // The deployed contract address is in topics[1]
    const contractAddress = setupEvent?.topics[1]
      ? (`0x${setupEvent.topics[1].slice(26)}` as Address)
      : undefined;

    console.log(
      "[createContract] Extracted contract address:",
      contractAddress
    );

    if (!contractAddress) {
      throw new Error("Failed to extract contract address from event logs");
    }

    return {
      contractAddress,
      transactionHash: receipt.receipt.transactionHash,
      smartWalletAddress,
      createdAt,
    };
  } catch (error) {
    console.error("[createImageContract] Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create image contract"
    );
  }
}
