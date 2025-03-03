import fetch from "node-fetch";
import * as cheerio from "cheerio";

interface TikTokProfileResult {
  avatarUrl: string | null;
  followerCount: number | null;
  followingCount: number | null;
  description: string | null;
  error: Error | null;
}

// List of realistic user agents to rotate through
const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
];

// Get a random user agent
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Add a random delay between min and max milliseconds
async function randomDelay(min = 1000, max = 3000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

// Check if the response is a bot challenge page
function isBotChallengePage(html: string): boolean {
  // TikTok bot challenge pages are typically short and contain specific patterns
  if (html.length < 2000) {
    return (
      html.includes("verify") ||
      html.includes("challenge") ||
      html.includes("security check") ||
      html.includes("captcha") ||
      html.includes("robot") ||
      html.includes("suspicious activity")
    );
  }
  return false;
}

// Format follower count from string to number
function formatFollowerCount(countStr: string | null): number | null {
  if (!countStr) return null;

  // Remove non-numeric characters except for K, M, B
  const cleaned = countStr.replace(/[^0-9.KMB]/gi, "");

  if (!cleaned) return null;

  // Convert K, M, B to actual numbers
  if (cleaned.includes("K")) {
    return parseFloat(cleaned.replace("K", "")) * 1000;
  } else if (cleaned.includes("M")) {
    return parseFloat(cleaned.replace("M", "")) * 1000000;
  } else if (cleaned.includes("B")) {
    return parseFloat(cleaned.replace("B", "")) * 1000000000;
  }

  return parseInt(cleaned, 10) || null;
}

/**
 * Fetches profile information for a TikTok user
 *
 * @param username - TikTok username without @ symbol
 * @param retryCount - Number of retries attempted (internal use)
 * @returns Promise resolving to profile information or null values if not found
 */
export async function getTikTokProfile(
  username: string,
  retryCount = 0
): Promise<TikTokProfileResult> {
  console.log("getTikTokProfile: Starting fetch for user", { username });

  // Maximum number of retries
  const MAX_RETRIES = 2;

  try {
    // Add a random delay before making the request (except on first attempt)
    if (retryCount > 0) {
      console.log(
        `getTikTokProfile: Retry attempt ${retryCount} for ${username}`
      );
      // Exponential backoff: longer delays for subsequent retries
      await randomDelay(2000 * retryCount, 5000 * retryCount);
    }

    // Clean username and construct profile URL
    const cleanUsername = username.replace(/^@/, "");
    const profileUrl = `https://www.tiktok.com/@${cleanUsername}`;

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
      // Add a cookie to simulate a previous visit
      Cookie: "tt_csrf_token=abcd1234-efgh-5678-ijkl-mnopqrstuvwx",
    };

    console.log("getTikTokProfile: Fetching profile page", { profileUrl });
    const response = await fetch(profileUrl, {
      headers,
      // Add timeout to avoid hanging requests
      timeout: 10000,
      // Follow redirects
      redirect: "follow",
    });

    if (!response.ok) {
      console.error("getTikTokProfile: Failed to fetch profile", {
        status: response.status,
        statusText: response.statusText,
      });

      // Retry on certain status codes
      if (
        retryCount < MAX_RETRIES &&
        [429, 403, 503].includes(response.status)
      ) {
        return getTikTokProfile(username, retryCount + 1);
      }

      return {
        avatarUrl: null,
        followerCount: null,
        followingCount: null,
        description: null,
        error: new Error(`HTTP error! status: ${response.status}`),
      };
    }

    const html = await response.text();
    console.log("getTikTokProfile: Got HTML response", {
      length: html.length,
      preview: html.slice(0, 100),
    });

    // Check if we got a bot challenge page
    if (isBotChallengePage(html)) {
      console.warn("getTikTokProfile: Detected bot challenge page for", {
        username,
      });

      // Retry if we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        console.log(
          `getTikTokProfile: Will retry (${retryCount + 1}/${MAX_RETRIES})`
        );
        return getTikTokProfile(username, retryCount + 1);
      } else {
        return {
          avatarUrl: null,
          followerCount: null,
          followingCount: null,
          description: null,
          error: new Error("Detected bot challenge page after max retries"),
        };
      }
    }

    // Parse HTML with cheerio
    const $ = cheerio.load(html);
    console.log("getTikTokProfile: Loaded HTML with cheerio");

    // Initialize result object
    const result: TikTokProfileResult = {
      avatarUrl: null,
      followerCount: null,
      followingCount: null,
      description: null,
      error: null,
    };

    // Extract avatar URL
    const possibleAvatarSelectors = [
      'img[src*="avatar"]',
      'img[alt*="profile"]',
      'img[alt*="avatar"]',
      'img[data-e2e="user-avatar"]',
      ".tiktok-avatar img",
      ".user-avatar img",
      ".avatar-wrapper img",
      ".profile-avatar img",
    ];

    // First try HTML selectors for avatar
    for (const selector of possibleAvatarSelectors) {
      const element = $(selector).first();
      if (element.length) {
        const avatarUrl = element.attr("src");
        if (avatarUrl) {
          console.log("getTikTokProfile: Found avatar in HTML", {
            selector,
            avatarUrl,
          });
          result.avatarUrl = decodeEscapedUrl(avatarUrl);
          break;
        }
      }
    }

    // Extract follower count - try common selectors
    const followerSelectors = [
      '[data-e2e="followers-count"]',
      ".follower-count",
      ".followers-count",
      'strong:contains("Followers")',
      'span:contains("Followers")',
      'div:contains("Followers")',
    ];

    for (const selector of followerSelectors) {
      const element = $(selector).first();
      if (element.length) {
        const followerText = element.text().trim();
        result.followerCount = formatFollowerCount(followerText);
        if (result.followerCount) {
          console.log("getTikTokProfile: Found follower count in HTML", {
            selector,
            count: result.followerCount,
          });
          break;
        }
      }
    }

    // Extract following count - try common selectors
    const followingSelectors = [
      '[data-e2e="following-count"]',
      ".following-count",
      'strong:contains("Following")',
      'span:contains("Following")',
      'div:contains("Following")',
    ];

    for (const selector of followingSelectors) {
      const element = $(selector).first();
      if (element.length) {
        const followingText = element.text().trim();
        result.followingCount = formatFollowerCount(followingText);
        if (result.followingCount) {
          console.log("getTikTokProfile: Found following count in HTML", {
            selector,
            count: result.followingCount,
          });
          break;
        }
      }
    }

    // Extract bio/description
    const bioSelectors = [
      '[data-e2e="user-bio"]',
      ".user-bio",
      ".profile-bio",
      ".biography",
      "div.bio",
      "div.desc",
      "div.description",
    ];

    for (const selector of bioSelectors) {
      const element = $(selector).first();
      if (element.length) {
        const bio = element.text().trim();
        if (bio) {
          console.log("getTikTokProfile: Found bio in HTML", {
            selector,
            bio,
          });
          result.description = bio;
          break;
        }
      }
    }

    // If not found in HTML, try script tags
    if (
      !result.avatarUrl ||
      !result.followerCount ||
      !result.followingCount ||
      !result.description
    ) {
      const scripts = $("script").get();
      for (const script of scripts) {
        const content = $(script).html() || "";

        // Look for various patterns in the script content
        if (
          content.includes("avatar") ||
          content.includes("userInfo") ||
          content.includes("SIGI_STATE")
        ) {
          // Try to extract avatar if not already found
          if (!result.avatarUrl) {
            const avatarPatterns = [
              /"avatarLarger":"([^"]+)"/,
              /"avatarMedium":"([^"]+)"/,
              /"avatarThumb":"([^"]+)"/,
              /"avatar":"([^"]+)"/,
              /avatar[^"]*":\s*"([^"]+)"/,
            ];

            for (const pattern of avatarPatterns) {
              const match = content.match(pattern);
              if (match) {
                console.log(
                  "getTikTokProfile: Found avatar in script tag",
                  decodeEscapedUrl(match[1])
                );
                result.avatarUrl = decodeEscapedUrl(match[1]);
                break;
              }
            }
          }

          // Try to extract follower count if not already found
          if (!result.followerCount) {
            const followerPatterns = [
              /"followerCount":(\d+)/,
              /"followers":(\d+)/,
              /"fans":(\d+)/,
              /follower[^:]*:(\d+)/,
            ];

            for (const pattern of followerPatterns) {
              const match = content.match(pattern);
              if (match) {
                const count = parseInt(match[1], 10);
                console.log(
                  "getTikTokProfile: Found follower count in script tag",
                  count
                );
                result.followerCount = count;
                break;
              }
            }
          }

          // Try to extract following count if not already found
          if (!result.followingCount) {
            const followingPatterns = [
              /"followingCount":(\d+)/,
              /"following":(\d+)/,
              /"followings":(\d+)/,
              /following[^:]*:(\d+)/,
            ];

            for (const pattern of followingPatterns) {
              const match = content.match(pattern);
              if (match) {
                const count = parseInt(match[1], 10);
                console.log(
                  "getTikTokProfile: Found following count in script tag",
                  count
                );
                result.followingCount = count;
                break;
              }
            }
          }

          // Try to extract bio/description if not already found
          if (!result.description) {
            const bioPatterns = [
              /"signature":"([^"]+)"/,
              /"bio":"([^"]+)"/,
              /"description":"([^"]+)"/,
              /signature[^:]*:"([^"]+)"/,
            ];

            for (const pattern of bioPatterns) {
              const match = content.match(pattern);
              if (match) {
                console.log(
                  "getTikTokProfile: Found bio in script tag",
                  match[1]
                );
                result.description = match[1];
                break;
              }
            }
          }
        }
      }
    }

    // Log what we found
    console.log("getTikTokProfile: Extracted profile data", {
      username,
      avatarFound: !!result.avatarUrl,
      followerCountFound: !!result.followerCount,
      followingCountFound: !!result.followingCount,
      descriptionFound: !!result.description,
    });

    return result;
  } catch (error) {
    console.error("getTikTokProfile: Error fetching profile", {
      username,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
      console.log(
        `getTikTokProfile: Will retry after error (${retryCount + 1}/${MAX_RETRIES})`
      );
      return getTikTokProfile(username, retryCount + 1);
    }

    return {
      avatarUrl: null,
      followerCount: null,
      followingCount: null,
      description: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

/**
 * Decodes escaped URLs from TikTok's response
 */
function decodeEscapedUrl(url: string): string {
  try {
    return decodeURIComponent(url.replace(/\\u002F/g, "/"));
  } catch (e) {
    return url;
  }
}

// For backward compatibility
export async function getTikTokAvatar(
  username: string,
  retryCount = 0
): Promise<{ avatarUrl: string | null; error: Error | null }> {
  console.log(
    "getTikTokAvatar: Using compatibility function, consider upgrading to getTikTokProfile"
  );
  const result = await getTikTokProfile(username, retryCount);
  return {
    avatarUrl: result.avatarUrl,
    error: result.error,
  };
}

export default getTikTokProfile;
