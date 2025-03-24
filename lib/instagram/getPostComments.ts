import { Post } from "../../types/agent";
import getFormattedComments from "./getFormattedComments";
import startCommentsScraping from "./startCommentsScraping";
import pollCommentScraping from "../apify/pollCommentScraping";

const getPostComments = async (scraping_posts: Post[]) => {
  try {
    const runInfo = await startCommentsScraping(
      scraping_posts.map((p) => p.post_url)
    );
    if (!runInfo) {
      console.error("[ERROR] Failed to start comments scraping");
      return [];
    }

    return pollCommentScraping({
      runInfo,
      posts: scraping_posts,
      platform: "Instagram",
      formatComments: getFormattedComments,
    });
  } catch (error) {
    console.error("[ERROR] Error in getPostComments:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return [];
  }
};

export default getPostComments;
