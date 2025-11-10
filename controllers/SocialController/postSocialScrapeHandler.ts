import { Request, Response } from "express";
import { selectSocials } from "../../lib/supabase/socials/selectSocials";
import startTikTokProfileScraping from "../../lib/tiktok/startProfileScraping";
import startInstagramProfileScraping from "../../lib/instagram/startProfileScraping";

export const postSocialScrapeHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { social_id } = req.body ?? {};

    if (!social_id || typeof social_id !== "string") {
      res.status(400).json({
        status: "error",
        error: "social_id body parameter is required",
      });
      return;
    }

    const socials = await selectSocials({ id: social_id });
    const social = socials[0];

    if (!social) {
      res.status(404).json({
        status: "error",
        error: `Social profile not found for id: ${social_id}`,
      });
      return;
    }

    const profileUrl = social.profile_url?.toLowerCase() ?? "";

    if (
      profileUrl.includes("tiktok.com") ||
      profileUrl.includes("instagram.com")
    ) {
      const isTikTok = profileUrl.includes("tiktok.com");
      const startScrape = isTikTok
        ? startTikTokProfileScraping
        : startInstagramProfileScraping;

      try {
        const runInfo = await startScrape(social.username);
        res.json({
          runId: runInfo?.runId ?? null,
          datasetId: runInfo?.datasetId ?? null,
          error: runInfo?.error ?? null,
        });
        return;
      } catch (error) {
        console.error("Failed to start social profile scraping:", error);
        res.status(500).json({
          status: "error",
          error:
            error instanceof Error ? error.message : "Failed to start scrape",
        });
        return;
      }
    }

    res.json({
      runId: null,
      datasetId: null,
      error: "Scrape trigger not yet implemented",
    });
  } catch (error) {
    console.error("Error starting social scrape:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
