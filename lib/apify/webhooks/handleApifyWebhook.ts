import apifyPayloadSchema from "./apifyPayloadSchema";
import { z } from "zod";
import handleInstagramProfileScraperResults from "./handleInstagramProfileScraperResults";

/**
 * Handles the Apify webhook payload: routes to appropriate handler based on actorId.
 * @param parsed - The parsed and validated Apify webhook payload
 * @returns An object with posts, socials, accountSocials, accountArtistIds, accountEmails, and sentEmails
 */
export default async function handleApifyWebhook(
  parsed: z.infer<typeof apifyPayloadSchema>
) {
  const fallbackResponse = {
    posts: [],
    social: null,
    accountSocials: [],
    accountArtistIds: [],
    accountEmails: [],
    sentEmails: null,
  };

  try {
    // Handle Instagram profile scraper results
    if (parsed.eventData.actorId === "dSCLg0C3YEZ83HzYX") {
      return await handleInstagramProfileScraperResults(parsed);
    } else {
      console.log(`Unhandled actorId: ${parsed.eventData.actorId}`);
      return fallbackResponse;
    }
  } catch (e) {
    console.error("Failed to handle Apify webhook:", e);
    return fallbackResponse;
  }
}
