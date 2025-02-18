import supabase from "./serverClient";
import createOrGetCommentSocials from "./createOrGetCommentSocials";

export interface CommentInput {
  text: string;
  timestamp: string;
  ownerUsername: string;
  postUrl: string;
}

const savePostComments = async (comments: CommentInput[]): Promise<void> => {
  try {
    const postUrls = [...new Set(comments.map((comment) => comment.postUrl))];
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id, post_url")
      .in("post_url", postUrls);

    if (postsError) {
      console.error("Failed to fetch posts:", postsError);
      return;
    }

    const postUrlToId = posts.reduce((acc: { [key: string]: string }, post) => {
      acc[post.post_url] = post.id;
      return acc;
    }, {});

    const usernameToSocialId = await createOrGetCommentSocials(comments);

    const formattedComments = comments
      .map((comment) => ({
        comment: comment.text,
        commented_at: comment.timestamp,
        post_id: postUrlToId[comment.postUrl],
        social_id: usernameToSocialId[comment.ownerUsername],
      }))
      .filter((comment) => comment.social_id); // Only include comments where we have a social_id

    if (formattedComments.length === 0) {
      console.log("No valid comments to save after filtering");
      return;
    }

    const { error: commentsError } = await supabase
      .from("post_comments")
      .upsert(formattedComments);

    if (commentsError) {
      console.error("Failed to save post comments:", commentsError);
      return;
    }

    console.log(`✅ Saved ${formattedComments.length} post comments`);
  } catch (error) {
    console.error("Error in savePostComments:", error);
  }
};

export default savePostComments;
