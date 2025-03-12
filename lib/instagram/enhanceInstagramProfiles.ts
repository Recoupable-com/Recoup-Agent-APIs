import { AuthorInput, Social } from "../../types/agent";
import uploadPfpToArweave from "../arweave/uploadPfpToArweave";
import { getProfiles } from "./getProfiles";

/**
 * Configuration for parallel uploads
 */
const PARALLEL_UPLOAD_CONFIG = {
  BATCH_SIZE: 5, // Number of concurrent uploads
  RETRY_ATTEMPTS: 2, // Number of retry attempts for failed uploads
  RETRY_DELAY: 1000, // Delay between retries in milliseconds
};

/**
 * Type for upload task
 */
interface UploadTask {
  username: string;
  avatarUrl: string;
  profile: Social;
}

/**
 * Type for upload result
 */
interface UploadResult {
  username: string;
  avatarUrl: string;
  profile: Social;
  success: boolean;
  arweaveUrl?: string;
  error?: Error;
}

/**
 * Enhances Instagram social profiles with additional data like avatars, follower counts, following counts, and bios
 *
 * @param profiles - Array of social profiles to enhance
 * @returns Enhanced profiles with additional data where available
 */
export async function enhanceInstagramProfiles(
  profiles: AuthorInput[]
): Promise<{
  enhancedProfiles: Social[];
}> {
  if (!profiles.length) {
    return {
      enhancedProfiles: [],
    };
  }

  console.log(`Enhancing ${profiles.length} Instagram profiles`);
  const startTime = Date.now();

  // Extract usernames from profiles
  const handles = profiles.map((profile) => profile.username.replace(/^@/, ""));

  // Fetch all profiles at once using Apify
  const { profiles: scrapedProfiles, errors } = await getProfiles(handles);

  // Prepare arrays for enhanced profiles and upload tasks
  const enhancedProfiles: Social[] = [];
  const uploadTasks: UploadTask[] = [];

  // First pass: Process all profiles and collect avatar upload tasks
  for (const originalProfile of profiles) {
    const username = originalProfile.username.replace(/^@/, "");
    console.log(`Processing Instagram profile: ${username}`);

    try {
      // Find matching scraped profile
      const scrapedProfile = scrapedProfiles.find(
        (profile) => profile.username.toLowerCase() === username.toLowerCase()
      );

      if (!scrapedProfile) {
        console.log(`No scraped data found for Instagram user: ${username}`);
        if (errors[username]) {
          console.error(
            `Error fetching profile for ${username}:`,
            errors[username]
          );
        }
        enhancedProfiles.push(originalProfile as Social);
        continue;
      }

      // Track what data was found
      let dataFound = false;
      const enhancedProfile = { ...originalProfile } as Social;

      // Add bio if available
      if (scrapedProfile.bio) {
        enhancedProfile.bio = scrapedProfile.bio;
        dataFound = true;
        console.log(`✅ Found bio for Instagram user: ${username}`);
      }

      // Add follower count if available
      if (scrapedProfile.followerCount) {
        enhancedProfile.followerCount = scrapedProfile.followerCount;
        dataFound = true;
        console.log(`✅ Found follower count for Instagram user: ${username}`);
      }

      // Add following count if available
      if (scrapedProfile.followingCount) {
        enhancedProfile.followingCount = scrapedProfile.followingCount;
        dataFound = true;
        console.log(`✅ Found following count for Instagram user: ${username}`);
      }

      // Add avatar if available
      if (scrapedProfile.avatar) {
        dataFound = true;
        console.log(`✅ Found avatar for Instagram user: ${username}`);

        // Check if avatar is already on Arweave
        if (scrapedProfile.avatar.includes("arweave.net")) {
          enhancedProfile.avatar = scrapedProfile.avatar;
          console.log(
            `   Avatar is already on Arweave: ${scrapedProfile.avatar}`
          );
          enhancedProfiles.push(enhancedProfile);
        } else {
          // Queue for parallel upload
          uploadTasks.push({
            username,
            avatarUrl: scrapedProfile.avatar,
            profile: enhancedProfile,
          });
        }
      } else {
        // No avatar to upload, add to enhanced profiles directly
        if (!dataFound) {
          console.log(
            `⚠️ No additional data found for Instagram user: ${username}`
          );
        }
        enhancedProfiles.push(enhancedProfile);
      }
    } catch (profileError) {
      console.error("Failed to process Instagram profile data:", profileError);
      enhancedProfiles.push(originalProfile as Social);
    }
  }

  // Second pass: Process avatar uploads in parallel batches
  if (uploadTasks.length > 0) {
    console.log(
      `Uploading ${uploadTasks.length} avatars to Arweave in parallel batches of ${PARALLEL_UPLOAD_CONFIG.BATCH_SIZE}`
    );

    // Process uploads in batches
    for (
      let i = 0;
      i < uploadTasks.length;
      i += PARALLEL_UPLOAD_CONFIG.BATCH_SIZE
    ) {
      const batchStartTime = Date.now();
      const batch = uploadTasks.slice(i, i + PARALLEL_UPLOAD_CONFIG.BATCH_SIZE);
      console.log(
        `Processing batch ${Math.floor(i / PARALLEL_UPLOAD_CONFIG.BATCH_SIZE) + 1}/${Math.ceil(uploadTasks.length / PARALLEL_UPLOAD_CONFIG.BATCH_SIZE)} (${batch.length} uploads)`
      );

      // Process batch in parallel
      const results = await Promise.all(
        batch.map(async (task) => {
          try {
            console.log(`Starting Arweave upload for ${task.username}...`);
            const arweaveUrl = await uploadPfpToArweave(task.avatarUrl);

            if (arweaveUrl) {
              console.log(
                `✅ Uploaded avatar to Arweave for Instagram user: ${task.username}`
              );
              console.log(`   Original URL: ${task.avatarUrl}`);
              console.log(`   Arweave URL: ${arweaveUrl}`);
              return {
                ...task,
                success: true,
                arweaveUrl,
              };
            } else {
              console.log(
                `⚠️ Arweave upload returned null for ${task.username}, using original URL`
              );
              return {
                ...task,
                success: false,
                error: new Error("Upload returned null"),
              };
            }
          } catch (error) {
            console.error(
              `❌ Error uploading avatar for ${task.username}:`,
              error
            );
            return {
              ...task,
              success: false,
              error: error instanceof Error ? error : new Error(String(error)),
            };
          }
        })
      );

      // Process results and add to enhanced profiles
      for (const result of results) {
        if (result.success && "arweaveUrl" in result && result.arweaveUrl) {
          result.profile.avatar = result.arweaveUrl;
        } else {
          // Fallback to original URL if Arweave upload fails
          result.profile.avatar = result.avatarUrl;
          console.log(
            `⚠️ Using original avatar URL for ${result.username} due to upload failure`
          );
        }
        enhancedProfiles.push(result.profile);
      }

      const batchDuration = Date.now() - batchStartTime;
      console.log(
        `Batch completed in ${batchDuration}ms (${Math.round(batchDuration / batch.length)}ms per upload)`
      );
    }
  }

  const totalDuration = Date.now() - startTime;
  console.log(
    `Enhanced ${enhancedProfiles.length} Instagram profiles in ${totalDuration}ms`
  );
  console.log(
    `${uploadTasks.length} avatars were processed for Arweave upload`
  );

  return {
    enhancedProfiles,
  };
}

export default enhanceInstagramProfiles;
