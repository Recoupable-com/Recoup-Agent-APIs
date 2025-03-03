import { AuthorInput, Social } from "../../types/agent";
import uploadPfpToArweave from "../arweave/uploadPfpToArweave";
import randomDelay from "../utils/randomDelay";
import scrapeInstagramProfile from "../scraping/platforms/instagram/scrapeInstagramProfile";

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

  const enhancedProfiles: Social[] = [];

  console.log(`Enhancing ${profiles.length} Instagram profiles`);

  // Process profiles sequentially to avoid triggering anti-bot measures
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    const username = profile.username.replace(/^@/, "");

    console.log(
      `[${i + 1}/${profiles.length}] Processing Instagram profile: ${username}`
    );

    // Add delay between requests (except for the first one)
    if (i > 0) {
      await randomDelay();
    }

    try {
      // Fetch profile data using the direct scraper
      const scrapedProfile = await scrapeInstagramProfile(username);

      // Track what data was found
      let dataFound = false;
      const enhancedProfile = { ...profile } as Social;

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
        enhancedProfile.avatar = scrapedProfile.avatar;
        dataFound = true;
        console.log(`✅ Found avatar for Instagram user: ${username}`);

        // Log avatar URL details
        if (scrapedProfile.avatar.includes("arweave.net")) {
          console.log(
            `   Avatar is already on Arweave: ${scrapedProfile.avatar}`
          );
        } else {
          console.log(`   Original avatar URL: ${scrapedProfile.avatar}`);
        }
      }

      // Add region if available
      if (scrapedProfile.region) {
        enhancedProfile.region = scrapedProfile.region;
        dataFound = true;
        console.log(`✅ Found region for Instagram user: ${username}`);
      }

      if (!dataFound) {
        console.log(
          `⚠️ No additional data found for Instagram user: ${username}`
        );
      }

      enhancedProfiles.push(enhancedProfile);
    } catch (profileError) {
      console.error("Failed to fetch Instagram profile data:", profileError);
      enhancedProfiles.push(profile as Social);
    }
  }

  console.log("enhancedProfiles", enhancedProfiles);

  return {
    enhancedProfiles,
  };
}

export default enhanceInstagramProfiles;
