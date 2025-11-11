import startTikTokProfileScraping from "../tiktok/startProfileScraping";
import startInstagramProfileScraping from "../instagram/startProfileScraping";
import startTwitterProfileScraping from "../twitter/startTwitterProfileScraping";

type ScrapeRunner = (handle: string) => Promise<{
  runId: string;
  datasetId: string;
  error?: string;
  data?: unknown;
} | null>;

export interface ProfileScrapeResult {
  runId: string | null;
  datasetId: string | null;
  error: string | null;
  supported: boolean;
}

const PLATFORM_SCRAPERS: Array<{
  match: (url: string) => boolean;
  scraper: ScrapeRunner;
}> = [
  {
    match: (url: string) => url.includes("tiktok.com"),
    scraper: startTikTokProfileScraping,
  },
  {
    match: (url: string) => url.includes("instagram.com"),
    scraper: startInstagramProfileScraping,
  },
  {
    match: (url: string) =>
      url.includes("twitter.com") || url.includes("x.com"),
    scraper: startTwitterProfileScraping,
  },
];

export const scrapeProfileUrl = async (
  profileUrl: string | null | undefined,
  username: string
): Promise<ProfileScrapeResult | null> => {
  if (!profileUrl) {
    return null;
  }

  const normalizedUrl = profileUrl.toLowerCase();
  const platform = PLATFORM_SCRAPERS.find((entry) =>
    entry.match(normalizedUrl)
  );

  if (!platform) {
    return null;
  }

  try {
    const result = await platform.scraper(username);

    if (!result) {
      return {
        runId: null,
        datasetId: null,
        error: "Failed to start scrape",
        supported: true,
      };
    }

    return {
      runId: result.runId ?? null,
      datasetId: result.datasetId ?? null,
      error: result.error ?? null,
      supported: true,
    };
  } catch (error) {
    return {
      runId: null,
      datasetId: null,
      error: error instanceof Error ? error.message : "Failed to start scrape",
      supported: true,
    };
  }
};
