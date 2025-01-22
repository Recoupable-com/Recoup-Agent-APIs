export const Funnel_Type = {
  NONE: "none",
  TIKTOK: "tiktok",
  TWITTER: "twitter",
  SPOTIFY: "spotify",
  INSTAGRAM: "instagram",
  WRAPPED: "wrapped",
};

export type SOCIAL_LINK = {
  id: string;
  link: string;
  type: string;
  artistId: string;
};
