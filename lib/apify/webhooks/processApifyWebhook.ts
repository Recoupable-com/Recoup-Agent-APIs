import { z } from "zod";
import apifyPayloadSchema from "./apifyPayloadSchema";
import handleInstagramProfileScraperResults from "./handleInstagramProfileScraperResults";

export type ApifyWebhookPayload = z.infer<typeof apifyPayloadSchema>;

export type ProcessApifyWebhookResult = Awaited<
  ReturnType<typeof handleInstagramProfileScraperResults>
>;

const INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID = "dSCLg0C3YEZ83HzYX" as const;

const processApifyWebhook = async (
  parsed: ApifyWebhookPayload
): Promise<ProcessApifyWebhookResult> => {
  const fallbackResponse: ProcessApifyWebhookResult = {
    social: null,
  };

  try {
    if (parsed.eventData.actorId === INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID) {
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
