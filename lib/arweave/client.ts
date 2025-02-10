import { TurboFactory } from "@ardrive/turbo-sdk";

if (!process.env.ARWEAVE_KEY) {
  throw new Error("ARWEAVE_KEY environment variable is not set");
}

// Parse the base64 encoded key
const ARWEAVE_KEY = JSON.parse(
  Buffer.from(process.env.ARWEAVE_KEY, "base64").toString()
);

// Initialize authenticated Turbo client with the key
const turboClient = TurboFactory.authenticated({
  privateKey: ARWEAVE_KEY,
});

export default turboClient;
