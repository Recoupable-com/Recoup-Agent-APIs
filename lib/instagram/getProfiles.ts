import { Social } from "../../types/agent";
import getDataset from "../apify/getDataset";
import getFormattedAccount from "./getFormattedAccount";
import runApifyActor from "../apify/runApifyActor";
import getActorStatus from "../apify/getActorStatus";

/**
 * Fetches profile information for multiple Instagram users using Apify's Instagram Profile Scraper
 *
 * @param handles - Array of Instagram usernames without @ symbol
 * @returns Promise resolving to an array of profile information
 */
export async function getProfiles(handles: string[]): Promise<{
  profiles: Social[];
  errors: Record<string, Error>;
}> {
  const cleanHandles = handles.map((handle) => handle.replace(/^@/, ""));

  try {
    const runInfo = await runApifyActor(
      { usernames: cleanHandles },
      "apify~instagram-profile-scraper"
    );

    if (!runInfo) {
      throw new Error("Failed to start Apify actor");
    }

    const { runId, datasetId } = runInfo;

    let attempts = 0;
    const maxAttempts = 30;
    let progress = 0;

    while (true) {
      attempts++;
      progress = (attempts / maxAttempts) * 100;

      await new Promise((resolve) => setTimeout(resolve, 3000));

=      const datasetItems = await getDataset(datasetId);

      const { status } = await getActorStatus(runId);

      const profiles: Social[] = [];
      const errors: Record<string, Error> = {};

      for (const item of datasetItems) {
        const handle = item.username || item.input?.username;

        if (item.error) {
          errors[handle] = new Error(item.error);
          continue;
        }

        const formattedAccount = getFormattedAccount([item]);
        if (formattedAccount?.profile) {
          profiles.push(formattedAccount.profile);
        } else {
          errors[handle] = new Error("Failed to format profile data");
        }
      }

      if (status === "SUCCEEDED" || attempts >= maxAttempts) {
        return { profiles, errors };
      }
    }
  } catch (error) {
    console.error("getProfiles: Error fetching profiles", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    const errors = handles.reduce(
      (acc, handle) => {
        acc[handle] =
          error instanceof Error ? error : new Error("Unknown error");
        return acc;
      },
      {} as Record<string, Error>
    );

    return { profiles: [], errors };
  }
}
