import fetch from "node-fetch";
import * as cheerio from "cheerio";
import randomDelay from "../../../utils/randomDelay";
import getRandomUserAgent from "../tiktok/getRandomUserAgent";
import { Social } from "../../../../types/agent";

/**
 * Fetches profile information for an Instagram user
 * Uses direct scraping via HTTP requests to extract profile data
 *
 * @param username - Instagram username without @ symbol
 * @param retryCount - Number of retries attempted (internal use)
 * @returns Promise resolving to profile information or null values if not found
 */
export async function scrapeInstagramProfile(
  username: string,
  retryCount = 0
): Promise<Social & { error?: Error }> {
  console.log("scrapeInstagramProfile: Starting fetch for user", { username });

  // Maximum number of retries
  const MAX_RETRIES = 2;

  try {
    // Add a random delay before making the request (except on first attempt)
    if (retryCount > 0) {
      console.log(
        `scrapeInstagramProfile: Retry attempt ${retryCount} for ${username}`
      );
      // Exponential backoff: longer delays for subsequent retries
      await randomDelay(2000 * retryCount, 5000 * retryCount);
    }

    // Clean username and construct profile URL
    const cleanUsername = username.replace(/^@/, "");
    const profileUrl = `https://www.instagram.com/${cleanUsername}/`;

    // Initialize result object
    const result: Social & { error?: Error } = {
      avatar: null,
      bio: null,
      followerCount: null,
      followingCount: null,
      id: "",
      profile_url: profileUrl,
      region: null,
      updated_at: "",
      username: cleanUsername,
      error: undefined,
    };

    // Browser-like headers with randomized user agent
    const headers = {
      "User-Agent": getRandomUserAgent(),
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "max-age=0",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Dest": "document",
      "Sec-Ch-Ua":
        '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"macOS"',
      "Upgrade-Insecure-Requests": "1",
      Referer: "https://www.google.com/",
      Connection: "keep-alive",
    };

    console.log("scrapeInstagramProfile: Fetching profile page", {
      profileUrl,
    });
    const response = await fetch(profileUrl, {
      headers,
      // Add timeout to avoid hanging requests
      timeout: 10000,
      // Follow redirects
      redirect: "follow",
    });

    if (!response.ok) {
      console.error("scrapeInstagramProfile: Failed to fetch profile", {
        status: response.status,
        statusText: response.statusText,
      });

      // Retry on certain status codes
      if (
        retryCount < MAX_RETRIES &&
        [429, 403, 503].includes(response.status)
      ) {
        return scrapeInstagramProfile(username, retryCount + 1);
      }
    } else {
      const html = await response.text();
      console.log("scrapeInstagramProfile: Got HTML response", {
        length: html.length,
        preview: html.slice(0, 100),
      });

      // Parse HTML with cheerio
      const $ = cheerio.load(html);
      console.log("scrapeInstagramProfile: Loaded HTML with cheerio");

      // Try to extract bio from meta description tag first (new primary method)
      try {
        console.log("Trying to extract bio from meta description tag...");

        // Get the meta description tag
        const metaDescription = $('meta[name="description"]').attr("content");

        if (metaDescription) {
          console.log("Found meta description:", metaDescription);

          // Extract bio from the description using regex
          // Format: "X Followers, Y Following, Z Posts - Username (@handle) on Instagram: "Bio text""
          // The previous pattern was too strict, let's make it more flexible
          const bioMatch = metaDescription.match(
            /on Instagram: [""](.+?)[""]$/s
          );

          if (bioMatch && bioMatch[1]) {
            // Decode HTML entities and clean up the bio text
            const bioText = bioMatch[1]
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .trim();

            result.bio = bioText;
            console.log(
              "Successfully extracted bio from meta description:",
              bioText
            );
          } else {
            console.log(
              "No bio match found in meta description with first pattern"
            );

            // Try an alternative pattern that might be used
            // This pattern is more flexible and doesn't require quotes
            const altBioMatch = metaDescription.match(
              /on Instagram: [""]?(.+?)[""]?$/s
            );

            if (altBioMatch && altBioMatch[1]) {
              const bioText = altBioMatch[1]
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .trim();

              result.bio = bioText;
              console.log(
                "Successfully extracted bio using alternative pattern:",
                bioText
              );
            } else {
              console.log("No bio match found with alternative pattern either");

              // Try an even more general pattern
              // Just extract everything after "on Instagram:"
              const generalBioMatch =
                metaDescription.match(/on Instagram:(.+)$/s);

              if (generalBioMatch && generalBioMatch[1]) {
                const bioText = generalBioMatch[1]
                  .replace(/&quot;/g, '"')
                  .replace(/&amp;/g, "&")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/^[\s"]+|[\s"]+$/g, "") // Remove quotes and whitespace at start/end
                  .trim();

                result.bio = bioText;
                console.log(
                  "Successfully extracted bio using general pattern:",
                  bioText
                );
              }
            }
          }
        } else {
          console.log("No meta description tag found");
        }
      } catch (error) {
        console.error("Error extracting bio from meta description:", error);
      }

      // Try to extract data from meta tags
      const metaTags = $('meta[property^="og:"]').get();
      for (const tag of metaTags) {
        const property = $(tag).attr("property");
        const content = $(tag).attr("content");

        if (property && content) {
          console.log(`Found meta tag: ${property} = ${content}`);

          if (property === "og:image" && !result.avatar) {
            result.avatar = content;
            console.log("Found avatar in meta tags:", content);
          }

          if (property === "og:description") {
            console.log("Found description in meta tags:", content);

            // Extract follower and following counts from the description
            // Format is typically: "X Followers, Y Following, Z Posts - See Instagram photos and videos from @username"
            const followerMatch = content.match(/(\d+(?:,\d+)*)\s+Followers?/i);
            if (followerMatch) {
              const followerCount = parseInt(
                followerMatch[1].replace(/,/g, ""),
                10
              );
              result.followerCount = followerCount;
              console.log(
                "Extracted follower count from description:",
                followerCount
              );
            }

            const followingMatch = content.match(/(\d+(?:,\d+)*)\s+Following/i);
            if (followingMatch) {
              const followingCount = parseInt(
                followingMatch[1].replace(/,/g, ""),
                10
              );
              result.followingCount = followingCount;
              console.log(
                "Extracted following count from description:",
                followingCount
              );
            }

            // If we haven't extracted the bio yet, try to extract it from og:description
            if (!result.bio) {
              // Try to extract bio from og:description if it contains the format
              const bioMatch = content.match(/on Instagram: [""](.+?)[""]$/);

              if (bioMatch && bioMatch[1]) {
                const bioText = bioMatch[1]
                  .replace(/&quot;/g, '"')
                  .replace(/&amp;/g, "&")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .trim();

                result.bio = bioText;
                console.log(
                  "Successfully extracted bio from og:description:",
                  bioText
                );
              }
            }
          }
        }
      }

      // If we still don't have a bio, try the previous methods as fallbacks
      if (!result.bio) {
        // Extract bio using multiple approaches
        console.log("Attempting to extract bio using fallback methods...");

        // Approach 1: Using CSS selectors based on the provided HTML example
        try {
          console.log("Trying bio extraction using CSS selectors...");

          // Target the specific span elements with the classes from the example
          const bioSpans = $(
            'span._ap3a._aaco._aacu._aacx._aad7._aade[dir="auto"]'
          ).get();
          console.log(
            `Found ${bioSpans.length} potential bio spans with the specific classes`
          );

          for (const span of bioSpans) {
            // Get the innermost span that contains the actual bio text
            const innerSpan = $(span).find(
              'span._ap3a._aaco._aacu._aacx._aad7._aade[dir="auto"]'
            );

            if (innerSpan.length > 0) {
              // Extract the HTML content to preserve <br> tags
              const bioHtml = innerSpan.html();

              if (bioHtml) {
                // Convert <br> tags to newlines and remove any HTML tags
                const bioText = bioHtml
                  .replace(/<br\s*\/?>/gi, "\n")
                  .replace(/<[^>]*>/g, "")
                  .trim();

                if (bioText) {
                  result.bio = bioText;
                  console.log(
                    "Successfully extracted bio using CSS selectors:",
                    bioText
                  );
                  break;
                }
              }
            } else {
              // If no inner span, try to get the text directly from this span
              const bioHtml = $(span).html();

              if (bioHtml) {
                // Convert <br> tags to newlines and remove any HTML tags
                const bioText = bioHtml
                  .replace(/<br\s*\/?>/gi, "\n")
                  .replace(/<[^>]*>/g, "")
                  .trim();

                if (bioText) {
                  result.bio = bioText;
                  console.log(
                    "Successfully extracted bio from direct span:",
                    bioText
                  );
                  break;
                }
              }
            }
          }
        } catch (error) {
          console.error("Error extracting bio using CSS selectors:", error);
        }

        // Approach 2: Try alternative selectors if the specific classes didn't work
        if (!result.bio) {
          try {
            console.log("Trying alternative CSS selectors for bio...");

            // Try to find any span with dir="auto" that might contain the bio
            const autoSpans = $('span[dir="auto"]').get();
            console.log(`Found ${autoSpans.length} spans with dir="auto"`);

            for (const span of autoSpans) {
              // Skip very short spans (likely not a bio)
              const text = $(span).text().trim();
              if (text.length > 10) {
                console.log(
                  "Potential bio text found:",
                  text.substring(0, 50) + (text.length > 50 ? "..." : "")
                );

                // Get the HTML to preserve <br> tags
                const bioHtml = $(span).html();

                if (bioHtml) {
                  // Convert <br> tags to newlines and remove any HTML tags
                  const bioText = bioHtml
                    .replace(/<br\s*\/?>/gi, "\n")
                    .replace(/<[^>]*>/g, "")
                    .trim();

                  if (bioText && bioText.length > 10) {
                    result.bio = bioText;
                    console.log(
                      "Successfully extracted bio using alternative selectors:",
                      bioText
                    );
                    break;
                  }
                }
              }
            }
          } catch (error) {
            console.error(
              "Error extracting bio using alternative selectors:",
              error
            );
          }
        }

        // Approach 3: Use regex as a fallback
        if (!result.bio) {
          try {
            console.log("Trying regex-based bio extraction...");

            // Pattern based on the provided HTML example
            // This looks for spans with the specific classes and extracts the content
            const bioRegex =
              /<span class="[^"]*_ap3a[^"]*_aaco[^"]*_aacu[^"]*_aacx[^"]*_aad7[^"]*_aade[^"]*"[^>]*dir="auto"[^>]*>(?:<div[^>]*>)?<span[^>]*dir="auto"[^>]*>(.*?)<\/span>/s;

            const bioMatch = html.match(bioRegex);

            if (bioMatch && bioMatch[1]) {
              // Clean up the extracted content
              const bioHtml = bioMatch[1];
              const bioText = bioHtml
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<[^>]*>/g, "")
                .trim();

              if (bioText) {
                result.bio = bioText;
                console.log("Successfully extracted bio using regex:", bioText);
              }
            } else {
              console.log("No bio match found with the specific regex pattern");

              // Try a more general regex pattern
              const generalBioRegex =
                /<span[^>]*dir="auto"[^>]*>(?:<div[^>]*>)?<span[^>]*dir="auto"[^>]*>(.*?)<\/span>/s;

              const generalBioMatch = html.match(generalBioRegex);

              if (generalBioMatch && generalBioMatch[1]) {
                // Clean up the extracted content
                const bioHtml = generalBioMatch[1];
                const bioText = bioHtml
                  .replace(/<br\s*\/?>/gi, "\n")
                  .replace(/<[^>]*>/g, "")
                  .trim();

                if (bioText && bioText.length > 10) {
                  result.bio = bioText;
                  console.log(
                    "Successfully extracted bio using general regex:",
                    bioText
                  );
                }
              }
            }
          } catch (error) {
            console.error("Error extracting bio using regex:", error);
          }
        }

        // If we still don't have a bio, try one more approach with a very general pattern
        if (!result.bio) {
          try {
            console.log("Trying final fallback for bio extraction...");

            // Look for any content that resembles a bio (multiple lines of text)
            const rawHtml = $.html();

            // This pattern looks for content with line breaks which is typical for bios
            const fallbackRegex =
              /dir="auto"[^>]*>([^<]{10,}(?:<br[^>]*>[^<]{3,})+)<\/span/i;

            const fallbackMatch = rawHtml.match(fallbackRegex);

            if (fallbackMatch && fallbackMatch[1]) {
              // Clean up the extracted content
              const bioHtml = fallbackMatch[1];
              const bioText = bioHtml
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<[^>]*>/g, "")
                .trim();

              if (bioText) {
                result.bio = bioText;
                console.log(
                  "Successfully extracted bio using fallback regex:",
                  bioText
                );
              }
            }
          } catch (error) {
            console.error("Error extracting bio using fallback regex:", error);
          }
        }
      }
    }

    // Log what we found
    console.log("scrapeInstagramProfile: Extracted profile data", {
      username,
      avatarFound: !!result.avatar,
      followerCountFound: !!result.followerCount,
      followingCountFound: !!result.followingCount,
      bioFound: !!result.bio,
    });

    return result;
  } catch (error) {
    console.error("scrapeInstagramProfile: Error fetching profile", {
      username,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
      console.log(
        `scrapeInstagramProfile: Will retry after error (${retryCount + 1}/${MAX_RETRIES})`
      );
      return scrapeInstagramProfile(username, retryCount + 1);
    }

    return {
      avatar: null,
      bio: null,
      followerCount: null,
      followingCount: null,
      id: "",
      profile_url: `https://www.instagram.com/${username}/`,
      region: null,
      updated_at: "",
      username: username,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}
export default scrapeInstagramProfile;
