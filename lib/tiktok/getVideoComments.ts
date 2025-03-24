import { Post } from "../../types/agent";
import { ScrapedComment } from "../scraping/types";
import getFormattedComments from "./getFormattedComments";
import startCommentsScraping from "./startCommentsScraping";
import pollCommentScraping from "../apify/pollCommentScraping";

const getVideoComments = async (
  scraping_posts: Post[]
): Promise<ScrapedComment[]> => {
  try {
    const runInfo = await startCommentsScraping(
      scraping_posts.map((p) => p.post_url)
    );
    if (!runInfo) {
      console.error("[ERROR] Failed to start video comments scraping");
      return [];
    }

    return pollCommentScraping({
      runInfo,
      posts: scraping_posts,
      platform: "TikTok",
      formatComments: getFormattedComments,
    });
  } catch (error) {
    console.error("[ERROR] Error in getVideoComments:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return [];
  }
};

export default getVideoComments;
