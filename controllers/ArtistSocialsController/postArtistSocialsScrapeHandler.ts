import type { RequestHandler } from "express";
import { getAccountSocials } from "../../lib/supabase/getAccountSocials";
import {
  ProfileScrapeResult,
  ScrapeProfileResult,
  scrapeProfileUrl,
} from "../../lib/apify/scrapeProfileUrl";

export const postArtistSocialsScrapeHandler: RequestHandler = async (
  req,
  res
) => {
  try {
    const { artist_account_id } = req.body ?? {};

    if (!artist_account_id || typeof artist_account_id !== "string") {
      res.status(400).json({
        status: "error",
        message: "artist_account_id body parameter is required",
      });
      return;
    }

    const { status, socials } = await getAccountSocials(artist_account_id);

    if (status === "error") {
      res.status(500).json({
        status: "error",
        message: "Failed to fetch artist socials",
      });
      return;
    }

    if (!socials.length) {
      res.json([]);
      return;
    }

    const resultsWithNulls = await Promise.all(
      socials.map(async (social) => {
        const scrapeResult = await scrapeProfileUrl(
          social.profile_url ?? null,
          social.username ?? ""
        );

        return scrapeResult;
      })
    );

    const results: ProfileScrapeResult[] = resultsWithNulls
      .filter((result): result is ScrapeProfileResult => result !== null)
      .map(({ runId, datasetId, error }) => ({
        runId,
        datasetId,
        error,
      }));

    res.json(results);
    return;
  } catch (error) {
    console.error("[ERROR] postArtistSocialsScrapeHandler error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
    return;
  }
};
