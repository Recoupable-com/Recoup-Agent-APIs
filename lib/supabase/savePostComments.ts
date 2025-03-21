import supabase from "./serverClient";
import createOrGetCommentSocials from "./createOrGetCommentSocials";
import { Database } from "../../types/database.types";

export interface CommentInput {
  text: string;
  timestamp: string;
  ownerUsername: string;
  postUrl: string;
}

type DbPostComment = Database["public"]["Tables"]["post_comments"]["Row"];

interface SavePostCommentsResult {
  data: DbPostComment[] | null;
  error: Error | null;
}

const savePostComments = async (
  comments: CommentInput[]
): Promise<SavePostCommentsResult> => {
  try {
    const postUrls = [...new Set(comments.map((comment) => comment.postUrl))];
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id, post_url")
      .in("post_url", postUrls);

    if (postsError) {
      console.error("Failed to fetch posts:", postsError);
      return { data: null, error: postsError };
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
      return { data: [], error: null };
    }

    const { data: storedComments, error: commentsError } = await supabase
      .from("post_comments")
      .upsert(formattedComments)
      .select(); // Add select() to return the inserted/updated rows

    if (commentsError) {
      console.error("Failed to save post comments:", commentsError);
      return { data: null, error: commentsError };
    }

    console.log(`✅ Saved ${storedComments.length} post comments`);
    return { data: storedComments, error: null };
  } catch (error) {
    console.error("Error in savePostComments:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error in savePostComments"),
    };
  }
};

export default savePostComments;
