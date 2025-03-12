import { AuthorInput, Social } from "../../types/agent";
import {
  batchUploadToArweave,
  UploadTask,
} from "../arweave/batchUploadToArweave";
import { getProfiles } from "./getProfiles";

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
  const profileMap = new Map<string, Social>();

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
            id: username,
            imageUrl: scrapedProfile.avatar,
            metadata: { profile: enhancedProfile },
          });

          // Store profile in map for later retrieval
          profileMap.set(username, enhancedProfile);
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

  // Second pass: Process avatar uploads in parallel using the batch upload library
  if (uploadTasks.length > 0) {
    console.log(
      `Uploading ${uploadTasks.length} avatars to Arweave in parallel`
    );

    const uploadResults = await batchUploadToArweave(uploadTasks);

    // Process results and add to enhanced profiles
    for (const result of uploadResults) {
      const profile =
        (result.metadata?.profile as Social) || profileMap.get(result.id);

      if (profile) {
        if (result.success && result.arweaveUrl) {
          profile.avatar = result.arweaveUrl;
        } else {
          // Fallback to original URL if Arweave upload fails
          profile.avatar = result.imageUrl;
          console.log(
            `⚠️ Using original avatar URL for ${result.id} due to upload failure`
          );
        }
        enhancedProfiles.push(profile);
      } else {
        console.error(`Could not find profile for ${result.id}`);
      }
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
