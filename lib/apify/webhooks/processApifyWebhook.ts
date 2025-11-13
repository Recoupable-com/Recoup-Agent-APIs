import { z } from "zod";
import apifyPayloadSchema from "./apifyPayloadSchema";
import handleInstagramProfileScraperResults from "./handleInstagramProfileScraperResults";

export type ApifyWebhookPayload = z.infer<typeof apifyPayloadSchema>;

export type ProcessApifyWebhookResult = Awaited<
  ReturnType<typeof handleInstagramProfileScraperResults>
>;

const processApifyWebhook = async (
  parsed: ApifyWebhookPayload
): Promise<ProcessApifyWebhookResult> => {
  const fallbackResponse: ProcessApifyWebhookResult = {
    social: null,
  };

  try {
    if (parsed.eventData.actorId === "dSCLg0C3YEZ83HzYX") {
      return await handleInstagramProfileScraperResults(parsed);
    }

    console.log(`Unhandled actorId: ${parsed.eventData.actorId}`);
    return fallbackResponse;
  } catch (error) {
    console.error("Failed to handle Apify webhook:", error);
    return fallbackResponse;
  }
};

export default processApifyWebhook;
