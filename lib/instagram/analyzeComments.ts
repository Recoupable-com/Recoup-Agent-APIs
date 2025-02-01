import savePostComments from "../supabase/savePostComments";
import getPostComments from "./getPostComments";
import getPostCommentsDatasetId from "./getPostCommentsDatasetId";

const analyzeComments = async (
  pilot_id: string | null,
  analysisId: string,
  latestPosts: any
) => {
  const commentsDatasetId = await getPostCommentsDatasetId(latestPosts);
  const postComments = await getPostComments(
    commentsDatasetId,
    pilot_id,
    analysisId
  );
  console.log("📝 [analyzeComments] Post comments:", postComments);

  // Save to post_comments table with comment author's social IDs
  const formattedComments = postComments.map((comment: any) => ({
    text: comment.comment,
    timestamp: new Date(comment.timestamp).toISOString(),
    ownerUsername: comment.username,
    postUrl: comment.post_url,
  }));
  await savePostComments(formattedComments);

  return postComments;
};

export default analyzeComments;
