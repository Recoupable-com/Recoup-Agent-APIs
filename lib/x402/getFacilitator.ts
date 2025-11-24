import { facilitator as coinbaseHostedFacilitator } from "@coinbase/x402";
import type { FacilitatorConfig, Resource } from "x402/types";
import { IS_PROD } from "../consts";

const FACILITATOR_URL: Resource = "https://x402.org/facilitator";

export const getFacilitator = (): FacilitatorConfig =>
  IS_PROD
    ? coinbaseHostedFacilitator
    : {
        url: FACILITATOR_URL,
      };
