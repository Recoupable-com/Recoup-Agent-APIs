import { AuthorInput, Social } from "../../types/agent";
import uploadPfpToArweave from "../arweave/uploadPfpToArweave";
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

  // Extract usernames from profiles
  const handles = profiles.map((profile) => profile.username.replace(/^@/, ""));

  // Fetch all profiles at once using Apify
  const { profiles: scrapedProfiles, errors } = await getProfiles(handles);

  const enhancedProfiles: Social[] = [];

  // Process each profile
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
        } else {
          // Upload avatar to Arweave to avoid caching issues
          console.log(`Uploading avatar for ${username} to Arweave...`);
          const arweaveUrl = await uploadPfpToArweave(scrapedProfile.avatar);

          if (arweaveUrl) {
            enhancedProfile.avatar = arweaveUrl;
            console.log(
              `✅ Uploaded avatar to Arweave for Instagram user: ${username}`
            );
            console.log(`   Original URL: ${scrapedProfile.avatar}`);
            console.log(`   Arweave URL: ${arweaveUrl}`);
          } else {
            // Fallback to original URL if Arweave upload fails
            enhancedProfile.avatar = scrapedProfile.avatar;
            console.log(
              `⚠️ Arweave upload failed for ${username}, using original URL`
            );
          }
        }
      }

      if (!dataFound) {
        console.log(
          `⚠️ No additional data found for Instagram user: ${username}`
        );
      }

      enhancedProfiles.push(enhancedProfile);
    } catch (profileError) {
      console.error("Failed to process Instagram profile data:", profileError);
      enhancedProfiles.push(originalProfile as Social);
    }
  }

  console.log("enhancedProfiles", enhancedProfiles);

  return {
    enhancedProfiles,
  };
}

export default enhanceInstagramProfiles;
