import { Post } from "../../types/agent";

const getFormattedComments = (data: any, posts: Post[]) => {
  const comments = data
    ?.filter((item: any) => item?.postUrl)
    .map((comment: any) => {
      const { postUrl, text, timestamp, ownerUsername } = comment;
      const post = posts.find((ele) => ele.post_url === postUrl);
      if (post && ownerUsername)
        return {
          comment: text,
          username: ownerUsername,
          commented_at: new Date(timestamp).toISOString(),
          post_id: post.id,
          profile_url: `https://instagram.com/${ownerUsername}`,
        };

      return null;
    });

  return comments;
};

export default getFormattedComments;
