import type { SocialProfileParser } from "./types";
import { instagramProfileParser } from "./instagramProfileParser";
import { tiktokProfileParser } from "./tiktokProfileParser";

export const INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID = "dSCLg0C3YEZ83HzYX" as const;
export const TIKTOK_PROFILE_SCRAPER_ACTOR_ID = "GdWCkxBtKWOsKjdch" as const;

const SOCIAL_PROFILE_PARSERS: Record<string, SocialProfileParser> = {
  [INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID]: instagramProfileParser,
  [TIKTOK_PROFILE_SCRAPER_ACTOR_ID]: tiktokProfileParser,
};

export const getSocialProfileParser = (
  actorId: string
): SocialProfileParser | undefined => SOCIAL_PROFILE_PARSERS[actorId];
