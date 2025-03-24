import { Post } from "../../types/agent";
import { ScrapedComment } from "../scraping/types";
import getActorStatus from "./getActorStatus";
import getDataset from "./getDataset";
import { ApifyRunInfo } from "./types";

const POLLING_INTERVAL = 5000; // 5 seconds

interface PollCommentScrapingParams {
  runInfo: ApifyRunInfo;
  posts: Post[];
  platform: string;
  formatComments: (data: any, posts: Post[]) => ScrapedComment[];
}

/**
 * Shared utility function to handle Apify comment scraping polling and data retrieval
 */
const pollCommentScraping = async ({
  runInfo,
  posts,
  platform,
  formatComments,
}: PollCommentScrapingParams): Promise<ScrapedComment[]> => {
  const { runId, datasetId } = runInfo;
  const startTime = Date.now();
  const postUrls = posts.map((post) => post.post_url);

  console.log(
    `[DEBUG] Starting ${platform} comment retrieval for ${postUrls.length} posts`
  );

  try {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));

      const { status } = await getActorStatus(runId);
      console.log(
        `[DEBUG] Apify run ${runId} status: ${status}. Elapsed time: ${Math.round(
          (Date.now() - startTime) / 1000
        )}s`
      );

      if (status === "FAILED") {
        console.error(`[ERROR] Apify run ${runId} failed`);
        return [];
      }

      if (status === "SUCCEEDED") {
        console.log(`[DEBUG] Apify run ${runId} completed successfully`);
        const data = await getDataset(datasetId);
        if (!data?.length) {
          console.error("[ERROR] No data returned from dataset");
          return [];
        }

        const comments = formatComments(data, posts);
        const totalTime = (Date.now() - startTime) / 1000;

        console.log("[DEBUG] Comments scraping completed:", {
          totalComments: comments.length,
          averageCommentsPerPost: (comments.length / postUrls.length).toFixed(
            1
          ),
          totalPosts: postUrls.length,
          processingTimeSeconds: totalTime.toFixed(1),
          commentsPerSecond: (comments.length / totalTime).toFixed(1),
        });

        return comments;
      }
    }
  } catch (error) {
    console.error(`[ERROR] Error in ${platform} comment polling:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return [];
  }
};

export default pollCommentScraping;
