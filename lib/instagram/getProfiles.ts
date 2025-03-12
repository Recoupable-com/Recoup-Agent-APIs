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

  // Set constants for polling
  const BASE_POLLING_INTERVAL = 5000; // 5 seconds

  // Adjust polling interval based on batch size
  const pollingInterval = Math.min(
    Math.max(BASE_POLLING_INTERVAL, cleanHandles.length * 200), // Increase interval for larger batches
    15000 // But cap at 15 seconds
  );

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

      // Get current status
      const { status } = await getActorStatus(runId);
      console.log(`Apify run ${runId} status: ${status}`);

      // If the run has failed, break out of the loop
      if (status === "FAILED") {
        console.error(`Apify run ${runId} failed`);
        break;
      }

      // If the run has succeeded, break out of the loop
      if (status === "SUCCEEDED") {
        console.log(`Apify run ${runId} completed successfully`);
        break;
      }

      // Continue polling if the run is still in progress
      console.log(
        `Waiting for Apify run ${runId} to complete. Elapsed time: ${Math.round((Date.now() - startTime) / 1000)}s`
      );
    }

    // Retrieve the dataset items regardless of how we exited the loop
    console.log(`Retrieving dataset items for datasetId: ${datasetId}`);
    const datasetItems = await getDataset(datasetId);
    console.log(`Retrieved ${datasetItems.length} dataset items`);

    const profiles: (Social & { postUrls?: string[] })[] = [];
    const errors: Record<string, Error> = {};

    // Process the dataset items
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

    // Check for missing profiles and add them to errors
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
