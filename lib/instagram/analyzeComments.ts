import saveFunnelComments from "../supabase/saveFunnelComments";
import getPostComments from "./getPostComments";
import getPostCommentsDatasetId from "./getPostCommentsDatasetId";

const analyzeComments = async (
  chat_id: string | null,
  analysisId: string,
  latestPosts: any,
) => {
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
