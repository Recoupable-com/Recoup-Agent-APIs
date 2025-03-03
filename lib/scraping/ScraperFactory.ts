import { SocialScraper } from "./types";
import { InstagramScraper } from "./platforms/InstagramScraper";
import { TikTokScraper } from "./platforms/tiktok/TikTokScraper";
import { SocialType } from "../../types/agent";

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
      // TODO: Implement other platform scrapers
      case "TWITTER":
      case "SPOTIFY":
        throw new Error(`Scraper for ${platform} not yet implemented`);
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }
}
