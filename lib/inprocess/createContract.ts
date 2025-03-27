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
      royaltyBPS: 1000, // 10%
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

    const SETUP_NEW_CONTRACT_EVENT =
      "0x89c5c58f568e3fa85f14c05b530f8586970ad06743c982f3b3c69b5f74910a14";

    const setupEvent = receipt.logs.find(
      (log: { topics: string[] }) => log.topics[0] === SETUP_NEW_CONTRACT_EVENT
    );
    const contractAddress = setupEvent?.address as Address;

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
