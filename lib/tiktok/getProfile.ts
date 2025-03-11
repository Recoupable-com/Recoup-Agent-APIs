import { Database } from "../../types/database.types";
import getDataset from "../apify/getDataset";
import getActorStatus from "../apify/getActorStatus";
import getFormattedAccount from "./getFormattedAccount";
import startProfileScraping from "./startProfileScraping";

type Social = Database["public"]["Tables"]["socials"]["Row"];

interface ProfileResult {
  error: Error | null;
  profile: Social | null;
  videoUrls: string[] | null;
}

const MAX_ATTEMPTS = 30;
const POLLING_INTERVAL = 3000; // 3 seconds

const getProfile = async (handle: string): Promise<ProfileResult> => {
  try {
    const runInfo = await startProfileScraping(handle);
    if (!runInfo) {
      throw new Error("Failed to start profile scraping");
    }

    const { runId, datasetId } = runInfo;
    let attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));

      const { status } = await getActorStatus(runId);

      if (status === "FAILED") {
        throw new Error("Profile scraping failed");
      }

      if (status === "SUCCEEDED" || attempts === MAX_ATTEMPTS) {
        const datasetItems: any = await getDataset(datasetId);
        const error = datasetItems?.[0]?.error;

        if (error) {
          return {
            error: new Error(error),
            profile: null,
            videoUrls: null,
          };
        }

        const formattedAccount = getFormattedAccount(datasetItems);
        if (formattedAccount?.profile) {
          return {
            error: null,
            profile: formattedAccount.profile,
            videoUrls: formattedAccount.videoUrls,
          };
        }
      }
    }

    throw new Error("Profile scraping timed out");
  } catch (error) {
    console.error("Error in getProfile:", error);
    return {
      profile: null,
      videoUrls: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error scraping profile"),
    };
  }
};

export default getProfile;
