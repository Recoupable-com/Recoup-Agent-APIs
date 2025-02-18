import { Post } from "../../types/agent";
import { ScrapedComment } from "../scraping/types";
import getActorStatus from "../apify/getActorStatus";
import getDataset from "../apify/getDataset";
import getFormattedComments from "./getFormattedComments";
import getVideoCommentsDatasetId from "./getVideoCommentsDatasetId";

const getVideoComments = async (scraping_posts: Post[]) => {
  const postUrls = scraping_posts.map(
    (scraping_post) => scraping_post.post_url
  );
  try {
    console.log("[getVideoComments] Starting comment scraping for posts:", {
      postCount: postUrls.length,
      urls: postUrls,
    });

    console.log("[getVideoComments] Creating dataset for comments...");
    const datasetId = await getVideoCommentsDatasetId(postUrls);
    console.log("[getVideoComments] Created dataset:", { datasetId });

    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log(
        `[getVideoComments] Attempt ${attempts}/${maxAttempts} to fetch comments`
      );

      const data = await getDataset(datasetId);
      console.log("[getVideoComments] Raw dataset response:", {
        dataLength: data?.length || 0,
        sampleData: data?.[0],
        hasData: !!data?.length,
      });

      if (!data?.length) {
        console.log("[getVideoComments] No data in dataset yet, retrying...");
        continue;
      }

      console.log("[getVideoComments] Formatting comments...");
      const formattedData = getFormattedComments(data, scraping_posts);
      console.log("[getVideoComments] Formatted comments:", {
        commentCount: formattedData?.length || 0,
        sampleComment: formattedData?.[0],
        hasComments: !!formattedData?.length,
        postCount: scraping_posts.length,
      });

      const status = await getActorStatus(datasetId);
      console.log("[getVideoComments] Actor status:", {
        status,
        attempt: attempts,
        hasFormattedData: !!formattedData?.length,
      });

      const isFinalAttempt = attempts === maxAttempts - 1;

      if (status === "SUCCEEDED" || isFinalAttempt) {
        if (!formattedData?.length) {
          console.warn(
            "[getVideoComments] Actor succeeded but no comments found"
          );
        } else {
          console.log("[getVideoComments] Successfully retrieved comments:", {
            commentCount: formattedData.length,
            postsWithComments: new Set(
              formattedData.map((c: ScrapedComment) => c.post_url)
            ).size,
          });
        }
        return formattedData;
      }
    }

    console.warn(
      "[getVideoComments] Max attempts reached without success, returning empty array"
    );
    return [];
  } catch (error) {
    console.error("[ERROR] Failed to get video comments:", error);
    return [];
  }
};

export default getVideoComments;
