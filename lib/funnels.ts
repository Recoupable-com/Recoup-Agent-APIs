export const Funnel_Type = {
  TIKTOK: "tiktok",
  YOUTUBE: "youtube",
  INSTAGRAM: "instagram",
  TWITTER: "twitter",
  SPOTIFY: "spotify",
  APPLE: "apple",
  WRAPPED: "wrapped",
} as const;

export type SOCIAL = {
  id: string;
  link: string;
  type: string;
  artistId: string;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  avatar: string | null;
  username: string | null;
  region: string | null;
};
