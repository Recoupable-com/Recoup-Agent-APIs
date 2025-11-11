import runApifyActor from "../apify/runApifyActor";
import { ApifyRunInfo } from "../apify/types";

const startThreadsProfileScraping = async (
  handle: string
): Promise<ApifyRunInfo | null> => {
  const cleanHandle = handle.trim().replace(/^@/, "");

  if (!cleanHandle) {
    throw new Error("Invalid Threads handle");
  }

  return runApifyActor(
    {
      usernames: [cleanHandle],
    },
    "apify~threads-profile-api-scraper"
  );
};

export default startThreadsProfileScraping;
