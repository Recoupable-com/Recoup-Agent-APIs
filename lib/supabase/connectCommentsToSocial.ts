import { ScrapedComment } from "../../types/agent";
import createSocial from "./createSocial";
import supabase from "./serverClient";

const connectCommentsToSocial = async (comments: ScrapedComment[]) => {
  try {
    const connectedComments: any = [];
    const connectPromise = comments.map(async (comment) => {
      try {
        const { social } = await createSocial({
          username: comment.username,
          profile_url: comment.profile_url,
        });
        if (social)
          connectedComments.push({
            comment: comment.comment,
            social_id: social.id,
            post_id: comment.post_id,
            commented_at: comment.commented_at,
          });
      } catch (error) {
        console.error(error);
      }
    });
    await Promise.all(connectPromise);
    await supabase.from("post_comments").insert(connectedComments).select("*");
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default connectCommentsToSocial;
