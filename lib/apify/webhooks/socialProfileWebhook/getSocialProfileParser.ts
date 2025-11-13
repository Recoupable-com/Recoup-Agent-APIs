import type { SocialProfileParser } from "./types";
import { instagramProfileParser } from "./instagramProfileParser";
import { tiktokProfileParser } from "./tiktokProfileParser";
import { youtubeProfileParser } from "./youtubeProfileParser";

export const INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID = "dSCLg0C3YEZ83HzYX" as const;
export const TIKTOK_PROFILE_SCRAPER_ACTOR_ID = "GdWCkxBtKWOsKjdch" as const;
export const YOUTUBE_PROFILE_SCRAPER_ACTOR_ID = "h7sDV53CddomktSi5" as const;

const SOCIAL_PROFILE_PARSERS: Record<string, SocialProfileParser> = {
  [INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID]: instagramProfileParser,
  [TIKTOK_PROFILE_SCRAPER_ACTOR_ID]: tiktokProfileParser,
  [YOUTUBE_PROFILE_SCRAPER_ACTOR_ID]: youtubeProfileParser,
};

export const getSocialProfileParser = (
  actorId: string
): SocialProfileParser | undefined => SOCIAL_PROFILE_PARSERS[actorId];
