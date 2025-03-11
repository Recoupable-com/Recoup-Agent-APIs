import { Social } from "../../types/agent";

interface ApifyInstagramProfile {
  username?: string;
  biography?: string;
  followersCount?: number;
  followingsCount?: number;
  profilePicUrl?: string;
  latestPosts?: { url: string }[];
  error?: any;
}

const getFormattedAccount = (data: ApifyInstagramProfile[]) => {
  if (data.length === 0 || data?.[0]?.error || !data?.[0]?.username)
    return {
      profile: null,
      postUrls: null,
    };

  const profile: Social = {
    id: "", // Empty string as it will be set when saving to database
    username: data[0].username || "",
    bio: data[0]?.biography || null,
    followerCount: data[0]?.followersCount || null,
    followingCount: data[0]?.followingsCount || null,
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
