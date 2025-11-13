import { z } from "zod";
import apifyPayloadSchema from "./apifyPayloadSchema";
import handleSocialProfileWebhook from "./socialProfileWebhook/handleSocialProfileWebhook";

export type ApifyWebhookPayload = z.infer<typeof apifyPayloadSchema>;

export type ProcessApifyWebhookResult = Awaited<
  ReturnType<typeof handleSocialProfileWebhook>
>;

const processApifyWebhook = async (
  parsed: ApifyWebhookPayload
): Promise<ProcessApifyWebhookResult> => {
  const fallbackResponse: ProcessApifyWebhookResult = {
    social: null,
  };

  try {
    return await handleSocialProfileWebhook(parsed);
  } catch (error) {
    console.error("Failed to handle Apify webhook:", error);
    return fallbackResponse;
  }
};

export default processApifyWebhook;
