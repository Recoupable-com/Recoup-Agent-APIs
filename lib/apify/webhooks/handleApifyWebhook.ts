import apifyPayloadSchema from "./apifyPayloadSchema";
import type { RequestHandler } from "express";
import processApifyWebhook from "./processApifyWebhook";

const handleApifyWebhook: RequestHandler = async (req, res) => {
  const parsed = apifyPayloadSchema.safeParse(req.body);

  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid payload", details: parsed.error.flatten() });
    return;
  }

  try {
    const result = await processApifyWebhook(parsed.data);
    // TODO: delete this after Facebook scraper is implemented
    console.log("Apify webhook processed successfully:", result.social);
    res.status(200).json(result);
  } catch (error) {
    console.error("Failed to process Apify webhook request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default handleApifyWebhook;
