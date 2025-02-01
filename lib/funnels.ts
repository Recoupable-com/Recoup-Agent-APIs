export const Funnel_Type = {
  NONE: "none",
  TIKTOK: "tiktok",
  TWITTER: "twitter",
  SPOTIFY: "spotify",
  INSTAGRAM: "instagram",
  WRAPPED: "wrapped",
};

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
