import { Social } from "../../types/agent";
import getDataset from "../apify/getDataset";
import getFormattedAccount from "./getFormattedAccount";
import runTikTokActor from "../apify/runTikTokActor";
import { OUTSTANDING_ERROR } from "../twitter/errors";
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
  console.log("getProfiles: Starting fetch for users", { handles });

  // Clean handles (remove @ if present)
  const cleanHandles = handles.map((handle) => handle.replace(/^@/, ""));

  try {
    // Run Apify actor for all handles at once
    const datasetId = await runTikTokActor(
      { usernames: cleanHandles },
      "apify~instagram-profile-scraper"
    );

    if (!datasetId) {
      throw new Error("Failed to start Apify actor");
    }

    // Initialize polling variables
    let attempts = 0;
    const maxAttempts = 30;
    let progress = 0;

    // Poll until we get results or timeout
    while (true) {
      attempts++;
      progress = (attempts / maxAttempts) * 100;

      // Wait 3 seconds between attempts
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Get current dataset results
      const datasetItems = await getDataset(datasetId);

      // Check actor status
      const status = await getActorStatus(datasetId);
      console.log("getProfiles: Actor status", { status });

      // Initialize results
      const profiles: Social[] = [];
      const errors: Record<string, Error> = {};

      // Process available results
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

      // Log current progress
      console.log("getProfiles: Polling status", {
        attempt: attempts,
        maxAttempts,
        progress: `${progress.toFixed(1)}%`,
        status,
        profilesFound: profiles.length,
        errorsFound: Object.keys(errors).length,
      });

      // Return results if actor succeeded or we've reached max attempts
      if (status === "SUCCEEDED" || progress > 95) {
        console.log("getProfiles: Completed fetch", {
          totalHandles: handles.length,
          successfulProfiles: profiles.length,
          failedProfiles: Object.keys(errors).length,
          finalStatus: status,
        });

        return { profiles, errors };
      }
    }
  } catch (error) {
    console.error("getProfiles: Error fetching profiles", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return error for all handles
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
