import { Social } from "../../types/agent";

interface ApifyInstagramProfile {
  username?: string;
  biography?: string;
  followersCount?: number;
  followingsCount?: number; // Original field name
  followsCount?: number; // Field name from Apify's response
  following?: number; // Alternative field name
  follows?: number; // Alternative field name
  profilePicUrl?: string;
  latestPosts?: { url: string }[];
  error?: any;
}

/**
 * Formats Instagram profile data from Apify's response
 *
 * @param data - Array of profile data from Apify
 * @returns Formatted profile and post URLs
 */
const getFormattedAccount = (data: ApifyInstagramProfile[]) => {
  if (data.length === 0 || data?.[0]?.error || !data?.[0]?.username)
    return {
      profile: null,
      postUrls: null,
    };

  // Extract following count with multiple fallbacks
  const followingCount =
    data[0]?.followingsCount ||
    data[0]?.followsCount ||
    data[0]?.following ||
    data[0]?.follows ||
    null;

  // Log if following count is missing
  if (followingCount === null) {
    console.log(
      `No following count found for Instagram profile: ${data[0].username}`
    );
    console.log("Available fields:", Object.keys(data[0]).join(", "));
    // Log the raw data to help debug
    console.log("Raw profile data:", JSON.stringify(data[0], null, 2));
  }

  const profile: Social = {
    id: "", // Empty string as it will be set when saving to database
    username: data[0].username || "",
    bio: data[0]?.biography || null,
    followerCount: data[0]?.followersCount || null,
    followingCount,
    avatar: data[0]?.profilePicUrl || null,
    profile_url: `https://instagram.com/${data[0].username}`,
    region: null,
    updated_at: new Date().toISOString(),
  };

  return {
    profile,
    postUrls: data?.[0]?.latestPosts?.map((post) => post.url) || [],
  };
};

export default getFormattedAccount;
