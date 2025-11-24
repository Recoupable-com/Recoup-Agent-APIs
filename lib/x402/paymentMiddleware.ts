import { paymentMiddleware } from "x402-express";
import type { RequestHandler } from "express";

const RECEIVING_WALLET_ADDRESS = "0x749B7b7A6944d72266Be9500FC8C221B6A7554Ce";
const FACILITATOR_URL = "https://x402.org/facilitator";

type RoutesConfig = Parameters<typeof paymentMiddleware>[1];

const routeConfig = {
  "GET /api/image/generate": {
    price: "$0.001",
    network: "base-sepolia" as const,
    config: {
      description: "Generate images using AI",
      inputSchema: {
        type: "object" as const,
        properties: {
          location: { type: "string" as const, description: "City name" },
        },
      },
      outputSchema: {
        type: "object" as const,
        properties: {
          weather: { type: "string" as const },
          temperature: { type: "number" as const },
        },
      },
    },
  },
} as RoutesConfig;

export const createPaymentMiddleware = (): RequestHandler => {
  return paymentMiddleware(RECEIVING_WALLET_ADDRESS, routeConfig, {
    url: FACILITATOR_URL,
  });
};
