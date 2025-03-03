import scrapeInstagramProfile from "../../lib/scraping/platforms/instagram/scrapeInstagramProfile";

/**
 * Simple test script to verify the scrapeInstagramProfile function
 *
 * Usage:
 * npx ts-node test/scripts/test-instagram-scraper.ts <instagram_username>
 *
 * Example:
 * npx ts-node test/scripts/test-instagram-scraper.ts instagram
 */

async function main() {
  try {
    // Get username from command line arguments
    const username = process.argv[2];

    if (!username) {
      console.error(
        "Please provide an Instagram username as a command line argument"
      );
      console.error(
        "Example: npx ts-node test/scripts/test-instagram-scraper.ts instagram"
      );
      process.exit(1);
    }

    console.log(`Testing scrapeInstagramProfile with username: ${username}`);

    // Call the scrapeInstagramProfile function
    const result = await scrapeInstagramProfile(username);

    // Log the results
    console.log("\n--- RESULTS ---");
    console.log("Username:", result.username);
    console.log("Profile URL:", result.profile_url);
    console.log("Avatar URL:", result.avatar || "Not found");
    console.log("Bio:", result.bio || "Not found");
    console.log("Follower Count:", result.followerCount || "Not found");
    console.log("Following Count:", result.followingCount || "Not found");
    console.log("Error:", result.error ? result.error.message : "None");

    // Check if all required fields are present
    const missingFields = [];
    if (!result.avatar) missingFields.push("avatar");
    if (!result.bio) missingFields.push("bio");
    if (!result.followerCount) missingFields.push("followerCount");
    if (!result.followingCount) missingFields.push("followingCount");

    if (missingFields.length > 0) {
      console.log("\n⚠️ WARNING: The following fields are missing:");
      missingFields.forEach((field) => console.log(`- ${field}`));
    } else {
      console.log("\n✅ SUCCESS: All required fields are present!");
    }
  } catch (error) {
    console.error("Error running test:", error);
    process.exit(1);
  }
}

main();
