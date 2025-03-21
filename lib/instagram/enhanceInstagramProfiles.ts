import {
  AuthorInput,
  EnhancedSocial,
  EnhanceProfilesResult,
} from "../../types/agent";
import { batchUploadToArweave } from "../arweave/batchUploadToArweave";
import { getProfiles } from "./getProfiles";
import { UploadTask } from "../arweave/types";

/**
 * Enhances Instagram social profiles with additional data like avatars, follower counts, following counts, and bios
 * Also includes post URLs for each profile if available
 *
 * @param profiles - Array of social profiles to enhance
 * @returns Enhanced profiles with additional data where available
 */
export async function enhanceInstagramProfiles(
  profiles: AuthorInput[]
): Promise<EnhanceProfilesResult> {
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
  const enhancedProfiles: EnhancedSocial[] = [];
  const uploadTasks: UploadTask[] = [];
  const profileMap = new Map<string, EnhancedSocial>();

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
        enhancedProfiles.push(originalProfile as EnhancedSocial);
        continue;
      }

      const enhancedProfile = { ...originalProfile } as EnhancedSocial;

      // Add bio if available
      if (scrapedProfile.bio) {
        enhancedProfile.bio = scrapedProfile.bio;
        console.log(`✅ Found bio for Instagram user: ${username}`);
      }

      // Add follower count if available
      if (scrapedProfile.followerCount) {
        enhancedProfile.followerCount = scrapedProfile.followerCount;
        console.log(`✅ Found follower count for Instagram user: ${username}`);
      }

      // Add following count if available
      if (scrapedProfile.followingCount) {
        enhancedProfile.followingCount = scrapedProfile.followingCount;
        console.log(`✅ Found following count for Instagram user: ${username}`);
      }

      // Add post URLs if available
      if (scrapedProfile.postUrls?.length) {
        enhancedProfile.postUrls = scrapedProfile.postUrls;
        console.log(
          `✅ Found ${scrapedProfile.postUrls.length} posts for Instagram user: ${username}`
        );
      }

      // Add avatar if available
      if (scrapedProfile.avatar) {
        console.log(`✅ Found avatar for Instagram user: ${username}`);

        uploadTasks.push({
          id: username,
          imageUrl: scrapedProfile.avatar,
          metadata: { profile: enhancedProfile },
        });

        profileMap.set(username, enhancedProfile);
      } else {
        enhancedProfiles.push(enhancedProfile);
      }
    } catch (profileError) {
      console.error("Failed to process Instagram profile data:", profileError);
      enhancedProfiles.push(originalProfile as EnhancedSocial);
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
        (result.metadata?.profile as EnhancedSocial) ||
        profileMap.get(result.id);

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
