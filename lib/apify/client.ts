import { ApifyClient } from "apify-client";
import { APIFY_TOKEN } from "../consts";

if (!APIFY_TOKEN) {
  throw new Error("Missing APIFY_TOKEN environment variable");
}

export const apifyClient = new ApifyClient({
  token: APIFY_TOKEN,
});

export default apifyClient;
