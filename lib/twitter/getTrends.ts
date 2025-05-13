import { verifyLoggedIn } from "./verifyLoggedIn.js";

export const getTrends = async (scraper: any) => {
  try {
    await verifyLoggedIn(scraper);
    const trends = await scraper.getTrends();
    return trends;
  } catch (error) {
    return [];
  }
};
