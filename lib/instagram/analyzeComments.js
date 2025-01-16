import getPostComments from "./getPostComments.js";
import getPostCommentsDatasetId from "./getPostCommentsDatasetId.js";

const analyzeComments = async (chat_id, analysisId, latestPosts) => {
  const commentsDatasetId = await getPostCommentsDatasetId(latestPosts);
  const postComments = await getPostComments(
    commentsDatasetId,
    chat_id,
    analysisId,
  );
  await saveFunnelComments(postComments);

  return postComments;
};

export default analyzeComments;
