import { ApifyClient } from "apify-client";
import { APIFY_TOKEN } from "../consts";

export const apifyClient = new ApifyClient({
  token: APIFY_TOKEN,
});

export default apifyClient;
