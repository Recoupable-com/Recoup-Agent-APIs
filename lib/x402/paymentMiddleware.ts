import { paymentMiddleware } from "x402-express";
import type { RequestHandler } from "express";
import { IS_PROD } from "../consts";
import { getFacilitator } from "./getFacilitator";

const RECEIVING_WALLET_ADDRESS = "0x749B7b7A6944d72266Be9500FC8C221B6A7554Ce";

type RoutesConfig = Parameters<typeof paymentMiddleware>[1];

const price = IS_PROD ? "$0.01" : "$0.0001";
const network = IS_PROD ? "base" : "base-sepolia";
const facilitator = getFacilitator();

const routeConfig = {
  "GET /api/image/generate": {
    price,
    network,
    config: {
      description: "Generate images using AI",
      inputSchema: {
        type: "object",
        properties: {
          location: { type: "string", description: "City name" },
        },
      },
      outputSchema: {
        type: "object",
        properties: {
          weather: { type: "string" },
          temperature: { type: "number" },
        },
      },
    },
  },
} as RoutesConfig;

export const createPaymentMiddleware = (): RequestHandler => {
  return paymentMiddleware(RECEIVING_WALLET_ADDRESS, routeConfig, facilitator);
};
