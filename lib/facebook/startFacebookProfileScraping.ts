import runApifyActor from "../apify/runApifyActor";
import { ApifyRunInfo } from "../apify/types";

const startFacebookProfileScraping = async (
  handle: string
): Promise<ApifyRunInfo | null> => {
  const cleanHandle = handle.trim().replace(/^@/, "");

  if (!cleanHandle) {
    throw new Error("Invalid Facebook handle");
  }

  const targetUrl = `https://www.facebook.com/${cleanHandle}`;

  return runApifyActor(
    {
      startUrls: [
        {
          url: targetUrl,
        },
      ],
    },
    "apify~facebook-pages-scraper"
  );
};

export default startFacebookProfileScraping;
