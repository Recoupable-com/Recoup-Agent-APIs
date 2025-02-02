import { Post } from "../../types/agent";

const getFormattedComments = (data: any, posts: Post[]) => {
  const comments =
    data?.map((comment: any) => {
      const { videoWebUrl, text, createTime, uniqueId } = comment;
      const post = posts.find((ele) => ele.post_url === videoWebUrl);
      if (post && uniqueId)
        return {
          comment: text,
          username: uniqueId,
          commented_at: new Date(createTime).toISOString(),
          post_id: post.id,
          profile_url: `https://tiktok.com/@${uniqueId}`,
        };

      return null;
    }) || [];

  return comments.filter((comment: any) => comment !== null);
};

export default getFormattedComments;
