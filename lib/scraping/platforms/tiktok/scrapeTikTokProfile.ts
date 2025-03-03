import fetch from "node-fetch";
import * as cheerio from "cheerio";
import randomDelay from "../../../utils/randomDelay";
import getRandomUserAgent from "./getRandomUserAgent";
import isBotChallengePage from "./isBotChallengePage";
import decodeEscapedUrl from "./decodeEscapedUrl";
import formatFollowerCount from "./formatFollowerCount";
import { Database } from "../../../../types/database.types";

type Social = Database["public"]["Tables"]["socials"]["Row"];

/**
 * Fetches profile information for a TikTok user
 *
 * @param username - TikTok username without @ symbol
 * @param retryCount - Number of retries attempted (internal use)
 * @returns Promise resolving to profile information or null values if not found
 */
export async function scrapeTikTokProfile(
  username: string,
  retryCount = 0
): Promise<Social & { error?: Error }> {
  console.log("scrapeTikTokProfile: Starting fetch for user", { username });

  // Maximum number of retries
  const MAX_RETRIES = 2;

  try {
    // Add a random delay before making the request (except on first attempt)
    if (retryCount > 0) {
      console.log(
        `scrapeTikTokProfile: Retry attempt ${retryCount} for ${username}`
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

    console.log("scrapeTikTokProfile: Fetching profile page", { profileUrl });
    const response = await fetch(profileUrl, {
      headers,
      // Add timeout to avoid hanging requests
      timeout: 10000,
      // Follow redirects
      redirect: "follow",
    });

    if (!response.ok) {
      console.error("scrapeTikTokProfile: Failed to fetch profile", {
        status: response.status,
        statusText: response.statusText,
      });

      // Retry on certain status codes
      if (
        retryCount < MAX_RETRIES &&
        [429, 403, 503].includes(response.status)
      ) {
        return scrapeTikTokProfile(username, retryCount + 1);
      }

      return {
        avatar: null,
        bio: null,
        followerCount: null,
        followingCount: null,
        id: "",
        profile_url: "",
        region: null,
        updated_at: "",
        username: "",
      };
    }

    const html = await response.text();
    console.log("scrapeTikTokProfile: Got HTML response", {
      length: html.length,
      preview: html.slice(0, 100),
    });

    // Check if we got a bot challenge page
    if (isBotChallengePage(html)) {
      console.warn("scrapeTikTokProfile: Detected bot challenge page for", {
        username,
      });

      // Retry if we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        console.log(
          `scrapeTikTokProfile: Will retry (${retryCount + 1}/${MAX_RETRIES})`
        );
        return scrapeTikTokProfile(username, retryCount + 1);
      } else {
        return {
          avatar: null,
          bio: null,
          followerCount: null,
          followingCount: null,
          id: "",
          profile_url: "",
          region: null,
          updated_at: "",
          username: "",
          error: new Error("Detected bot challenge page after max retries"),
        };
      }
    }

    // Parse HTML with cheerio
    const $ = cheerio.load(html);
    console.log("scrapeTikTokProfile: Loaded HTML with cheerio");

    // Initialize result object
    const result: Social & { error?: Error } = {
      avatar: null,
      bio: null,
      followerCount: null,
      followingCount: null,
      id: "",
      profile_url: "",
      region: null,
      updated_at: "",
      username: "",
      error: undefined,
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
          console.log("scrapeTikTokProfile: Found avatar in HTML", {
            selector,
            avatarUrl,
          });
          result.avatar = decodeEscapedUrl(avatarUrl);
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
          console.log("scrapeTikTokProfile: Found follower count in HTML", {
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
          console.log("scrapeTikTokProfile: Found following count in HTML", {
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
          console.log("scrapeTikTokProfile: Found bio in HTML", {
            selector,
            bio,
          });
          result.bio = bio;
          break;
        }
      }
    }

    // If not found in HTML, try script tags
    if (
      !result.avatar ||
      !result.followerCount ||
      !result.followingCount ||
      !result.bio
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
          if (!result.avatar) {
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
                  "scrapeTikTokProfile: Found avatar in script tag",
                  decodeEscapedUrl(match[1])
                );
                result.avatar = decodeEscapedUrl(match[1]);
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
                  "scrapeTikTokProfile: Found follower count in script tag",
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
                  "scrapeTikTokProfile: Found following count in script tag",
                  count
                );
                result.followingCount = count;
                break;
              }
            }
          }

          // Try to extract bio/description if not already found
          if (!result.bio) {
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
                  "scrapeTikTokProfile: Found bio in script tag",
                  match[1]
                );
                result.bio = match[1];
                break;
              }
            }
          }
        }
      }
    }

    // Log what we found
    console.log("scrapeTikTokProfile: Extracted profile data", {
      username,
      avatarFound: !!result.avatar,
      followerCountFound: !!result.followerCount,
      followingCountFound: !!result.followingCount,
      bioFound: !!result.bio,
    });

    return result;
  } catch (error) {
    console.error("scrapeTikTokProfile: Error fetching profile", {
      username,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
      console.log(
        `scrapeTikTokProfile: Will retry after error (${retryCount + 1}/${MAX_RETRIES})`
      );
      return scrapeTikTokProfile(username, retryCount + 1);
    }

    return {
      avatar: null,
      bio: null,
      followerCount: null,
      followingCount: null,
      id: "",
      profile_url: "",
      region: null,
      updated_at: "",
      username: "",
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

export default scrapeTikTokProfile;
