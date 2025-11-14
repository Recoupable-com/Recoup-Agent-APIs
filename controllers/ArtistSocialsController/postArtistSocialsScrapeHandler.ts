import type { RequestHandler } from "express";
import { getAccountSocials } from "../../lib/supabase/getAccountSocials";
import { scrapeProfileUrlBatch } from "../../lib/apify/scrapeProfileUrlBatch";

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

    const results = await scrapeProfileUrlBatch(
      socials.map((social) => ({
        profileUrl: social.profile_url,
        username: social.username,
      }))
    );

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
