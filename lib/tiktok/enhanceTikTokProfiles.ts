import scrapeTikTokProfile from "../scraping/platforms/tiktok/scrapeTikTokProfile";
import uploadPfpToArweave from "../arweave/uploadPfpToArweave";
import randomDelay from "../utils/randomDelay";
import { AuthorInput, Social } from "../../types/agent";

/**
 * Enhances TikTok social profiles with additional data like avatars, follower counts, following counts, and bios
 *
 * @param profiles - Array of social profiles to enhance
 * @returns Enhanced profiles with additional data where available
 */
export async function enhanceTikTokProfiles(profiles: AuthorInput[]): Promise<{
  enhancedProfiles: Social[];
}> {
  if (!profiles.length) {
    return {
      enhancedProfiles: [],
    };
  }

  const enhancedProfiles: Social[] = [];

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
      const scrapedProfile = await scrapeTikTokProfile(username);

      // Track what data was found
      let dataFound = false;
      const enhancedProfile = { ...profile, ...scrapedProfile };

      if (scrapedProfile.avatar) {
        // Upload avatar to Arweave to avoid caching issues
        console.log(`Uploading avatar for ${username} to Arweave...`);
        const arweaveUrl = await uploadPfpToArweave(scrapedProfile.avatar);

        if (arweaveUrl) {
          enhancedProfile.avatar = arweaveUrl;
          console.log(
            `✅ Uploaded avatar to Arweave for TikTok user: ${username}`
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

        dataFound = true;
        console.log(`✅ Found avatar for TikTok user: ${username}`);
      }

      enhancedProfiles.push(enhancedProfile);
    } catch (profileError) {
      console.error("Failed to fetch TikTok profile data:", profileError);
      enhancedProfiles.push(profile as Social);
    }
  }

  console.log("enhancedProfiles", enhancedProfiles);

  return {
    enhancedProfiles,
  };
}

export default enhanceTikTokProfiles;
