import { Social } from "../../types/agent";
import getDataset from "../apify/getDataset";
import getFormattedAccount from "./getFormattedAccount";
import runApifyActor from "../apify/runApifyActor";
import getActorStatus from "../apify/getActorStatus";

/**
 * Fetches profile information for multiple Instagram users using Apify's Instagram Profile Scraper
 *
 * @param handles - Array of Instagram usernames without @ symbol
 * @returns Promise resolving to profile information with post URLs
 */
export async function getProfiles(handles: string[]): Promise<{
  profiles: (Social & { postUrls?: string[] })[];
  errors: Record<string, Error>;
}> {
  const cleanHandles = handles.map((handle) => handle.replace(/^@/, ""));

  const pollingInterval = 5000;

  console.log(
    `Fetching profiles for ${cleanHandles.length} handles with polling interval ${pollingInterval}ms`
  );

  try {
    const runInfo = await runApifyActor(
      { usernames: cleanHandles },
      "apify~instagram-profile-scraper"
    );

    if (!runInfo) {
      throw new Error("Failed to start Apify actor");
    }

    const { runId, datasetId } = runInfo;
    console.log(
      `Started Apify actor run with runId: ${runId}, datasetId: ${datasetId}`
    );

    const startTime = Date.now();

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));

      const { status } = await getActorStatus(runId);
      console.log(`Apify run ${runId} status: ${status}`);

      if (status === "FAILED") {
        console.error(`Apify run ${runId} failed`);
        break;
      }

      if (status === "SUCCEEDED") {
        console.log(`Apify run ${runId} completed successfully`);
        break;
      }

      console.log(
        `Waiting for Apify run ${runId} to complete. Elapsed time: ${Math.round((Date.now() - startTime) / 1000)}s`
      );
    }

    const datasetItems = await getDataset(datasetId);
    const profiles: (Social & { postUrls?: string[] })[] = [];
    const errors: Record<string, Error> = {};

    for (const item of datasetItems) {
      const handle = item.username || item.input?.username;

      if (!handle) {
        console.warn(`Missing username in dataset item:`, item);
        continue;
      }

      if (item.error) {
        console.error(`Error in dataset item for ${handle}: ${item.error}`);
        errors[handle] = new Error(item.error);
        continue;
      }

      const formattedAccount = getFormattedAccount([item]);
      if (formattedAccount?.profile) {
        profiles.push({
          ...formattedAccount.profile,
          postUrls: formattedAccount.postUrls || [],
        });
      } else {
        console.error(`Failed to format profile data for ${handle}`);
        errors[handle] = new Error("Failed to format profile data");
      }
    }

    for (const handle of cleanHandles) {
      if (
        !profiles.some(
          (p) => p.username.toLowerCase() === handle.toLowerCase()
        ) &&
        !errors[handle]
      ) {
        console.warn(`No data found for handle: ${handle}`);
        errors[handle] = new Error("No data returned from Apify");
      }
    }

    console.log(
      `Processed ${profiles.length} profiles with ${Object.keys(errors).length} errors`
    );
    return { profiles, errors };
  } catch (error) {
    console.error("Error fetching profiles", {
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
