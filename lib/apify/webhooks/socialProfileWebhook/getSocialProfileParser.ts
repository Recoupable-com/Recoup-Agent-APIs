import type { SocialProfileParser } from "./types";
import { facebookProfileParser } from "./facebookProfileParser";
import { instagramProfileParser } from "./instagramProfileParser";
import { tiktokProfileParser } from "./tiktokProfileParser";
import { threadsProfileParser } from "./threadsProfileParser";
import { twitterProfileParser } from "./twitterProfileParser";
import { youtubeProfileParser } from "./youtubeProfileParser";

export const INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID = "dSCLg0C3YEZ83HzYX" as const;
export const TIKTOK_PROFILE_SCRAPER_ACTOR_ID = "GdWCkxBtKWOsKjdch" as const;
export const YOUTUBE_PROFILE_SCRAPER_ACTOR_ID = "h7sDV53CddomktSi5" as const;
export const THREADS_PROFILE_SCRAPER_ACTOR_ID = "kJdK90pa2hhYYrCK5" as const;
export const TWITTER_PROFILE_SCRAPER_ACTOR_ID = "nfp1fpt5gUlBwPcor" as const;
export const FACEBOOK_PROFILE_SCRAPER_ACTOR_ID = "4Hv5RhChiaDk6iwad" as const;

const SOCIAL_PROFILE_PARSERS: Record<string, SocialProfileParser> = {
  [INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID]: instagramProfileParser,
  [TIKTOK_PROFILE_SCRAPER_ACTOR_ID]: tiktokProfileParser,
  [YOUTUBE_PROFILE_SCRAPER_ACTOR_ID]: youtubeProfileParser,
  [THREADS_PROFILE_SCRAPER_ACTOR_ID]: threadsProfileParser,
  [TWITTER_PROFILE_SCRAPER_ACTOR_ID]: twitterProfileParser,
  [FACEBOOK_PROFILE_SCRAPER_ACTOR_ID]: facebookProfileParser,
};

export const getSocialProfileParser = (
  actorId: string
): SocialProfileParser | undefined => SOCIAL_PROFILE_PARSERS[actorId];
