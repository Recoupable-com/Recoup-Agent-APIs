import { Database } from "../../types/database.types";
import { SocialScraper } from "./types";
import { InstagramScraper } from "./platforms/InstagramScraper";
import { TikTokScraper } from "./platforms/tiktok/TikTokScraper";
import { TwitterScraper } from "./platforms/twitter/TwitterScraper";

type SocialType = Database["public"]["Enums"]["social_type"];

export class ScraperFactory {
  private static scrapers: Map<SocialType, SocialScraper> = new Map();

  /**
   * Get a scraper instance for the specified platform.
   * Uses singleton pattern to reuse scraper instances.
   */
  static getScraper(platform: SocialType): SocialScraper {
    let scraper = this.scrapers.get(platform);

    if (!scraper) {
      scraper = this.createScraper(platform);
      this.scrapers.set(platform, scraper);
    }

    return scraper;
  }

  private static createScraper(platform: SocialType): SocialScraper {
    switch (platform) {
      case "INSTAGRAM":
        return new InstagramScraper();
      case "TIKTOK":
        return new TikTokScraper();
      case "TWITTER":
        return new TwitterScraper();
      // TODO: Implement other platform scrapers
      case "SPOTIFY":
        throw new Error(`Scraper for ${platform} not yet implemented`);
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }
}
