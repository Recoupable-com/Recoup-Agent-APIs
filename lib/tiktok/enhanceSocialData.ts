import getTikTokProfile from "../tiktok/getTikTokProfile";
import uploadPfpToArweave from "../arweave/uploadPfpToArweave";

export interface SocialProfile {
  username: string;
  profile_url: string;
  [key: string]: any;
}

/**
 * Add a random delay between min and max milliseconds
 */
async function randomDelay(min = 2000, max = 4000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(
    `Waiting ${(delay / 1000).toFixed(1)} seconds before next request...`
  );
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Enhances TikTok social profiles with additional data like avatars, follower counts, following counts, and bios
 *
 * @param profiles - Array of social profiles to enhance
 * @returns Enhanced profiles with additional data where available
 */
export async function enhanceTikTokProfiles(
  profiles: SocialProfile[]
): Promise<{
  enhancedProfiles: SocialProfile[];
  stats: {
    total: number;
    enhanced: number;
    skipped: number;
    failed: number;
    avatarsFound: number;
    followerCountsFound: number;
    followingCountsFound: number;
    biosFound: number;
    arweaveUploads: number;
  };
}> {
  if (!profiles.length) {
    return {
      enhancedProfiles: [],
      stats: {
        total: 0,
        enhanced: 0,
        skipped: 0,
        failed: 0,
        avatarsFound: 0,
        followerCountsFound: 0,
        followingCountsFound: 0,
        biosFound: 0,
        arweaveUploads: 0,
      },
    };
  }

  const enhancedProfiles: SocialProfile[] = [];
  let enhancedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let avatarsFound = 0;
  let followerCountsFound = 0;
  let followingCountsFound = 0;
  let biosFound = 0;
  let arweaveUploads = 0;

  console.log(`Enhancing ${profiles.length} TikTok profiles`);

  // Process profiles sequentially to avoid triggering anti-bot measures
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    const username = profile.username.replace(/^@/, "");

    console.log(
      `[${i + 1}/${profiles.length}] Processing TikTok profile: ${username}`
    );

    // Add delay between requests (except for the first one)
    if (i > 0) {
      await randomDelay();
    }

    try {
      // Fetch profile data
      const { avatarUrl, followerCount, followingCount, description, error } =
        await getTikTokProfile(username);

      // Track what data was found
      let dataFound = false;
      const enhancedProfile = { ...profile };

      if (avatarUrl) {
        // Upload avatar to Arweave to avoid caching issues
        console.log(`Uploading avatar for ${username} to Arweave...`);
        const arweaveUrl = await uploadPfpToArweave(avatarUrl);

        if (arweaveUrl) {
          enhancedProfile.avatar = arweaveUrl;
          arweaveUploads++;
          console.log(
            `✅ Uploaded avatar to Arweave for TikTok user: ${username}`
          );
          console.log(`   Original URL: ${avatarUrl}`);
          console.log(`   Arweave URL: ${arweaveUrl}`);
        } else {
          // Fallback to original URL if Arweave upload fails
          enhancedProfile.avatar = avatarUrl;
          console.log(
            `⚠️ Arweave upload failed for ${username}, using original URL`
          );
        }

        avatarsFound++;
        dataFound = true;
        console.log(`✅ Found avatar for TikTok user: ${username}`);
      }

      if (followerCount !== null) {
        enhancedProfile.followerCount = followerCount;
        followerCountsFound++;
        dataFound = true;
        console.log(
          `✅ Found follower count for TikTok user: ${username}: ${followerCount}`
        );
      }

      if (followingCount !== null) {
        enhancedProfile.followingCount = followingCount;
        followingCountsFound++;
        dataFound = true;
        console.log(
          `✅ Found following count for TikTok user: ${username}: ${followingCount}`
        );
      }

      if (description) {
        enhancedProfile.bio = description;
        biosFound++;
        dataFound = true;
        console.log(`✅ Found bio for TikTok user: ${username}`);
      }

      if (dataFound) {
        enhancedCount++;
      } else {
        if (error) {
          console.warn(
            `⚠️ Error fetching TikTok profile data for ${username}:`,
            error.message
          );
        } else {
          console.warn(`⚠️ No profile data found for TikTok user: ${username}`);
        }
        failedCount++;
      }

      enhancedProfiles.push(enhancedProfile);
    } catch (profileError) {
      console.error("Failed to fetch TikTok profile data:", profileError);
      enhancedProfiles.push(profile);
      failedCount++;
    }
  }

  console.log(
    `Enhanced ${enhancedCount}/${profiles.length} TikTok profiles (${skippedCount} skipped, ${failedCount} failed)`
  );
  console.log(
    `Data found: ${avatarsFound} avatars, ${followerCountsFound} follower counts, ${followingCountsFound} following counts, ${biosFound} bios`
  );
  console.log(
    `Arweave uploads: ${arweaveUploads}/${avatarsFound} avatars uploaded to Arweave`
  );

  return {
    enhancedProfiles,
    stats: {
      total: profiles.length,
      enhanced: enhancedCount,
      skipped: skippedCount,
      failed: failedCount,
      avatarsFound,
      followerCountsFound,
      followingCountsFound,
      biosFound,
      arweaveUploads,
    },
  };
}

export default enhanceTikTokProfiles;
