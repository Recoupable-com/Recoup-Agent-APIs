import { Post } from "../../types/agent";

interface FormattedComment {
  comment: string;
  username: string;
  commented_at: string;
  post_id: string;
  profile_url: string;
  avatar?: string;
}

interface RawTikTokComment {
  videoWebUrl: string;
  text: string;
  createTime: string;
  uniqueId: string;
  avatarThumb?: string;
  avatarMedium?: string;
  avatarLarge?: string;
  profilePicture?: string;
}

const getFormattedComments = (data: any, posts: Post[]) => {
  console.log("getFormattedComments: Starting TikTok comment formatting", {
    hasData: !!data,
    commentCount: data?.length,
    postCount: posts?.length,
    sampleComment: data?.[0]
      ? {
          hasText: !!data[0].text,
          hasUniqueId: !!data[0].uniqueId,
          hasCreateTime: !!data[0].createTime,
          // Log all available fields to see what profile info we have
          availableFields: Object.keys(data[0]),
          authorInfo: {
            uniqueId: data[0].uniqueId,
            // Log any potential avatar/profile picture fields
            avatarThumb: data[0].avatarThumb,
            avatarMedium: data[0].avatarMedium,
            avatarLarge: data[0].avatarLarge,
            profilePicture: data[0].profilePicture,
          },
        }
      : null,
  });

  const comments =
    data?.map((comment: RawTikTokComment) => {
      const { videoWebUrl, text, createTime, uniqueId } = comment;

      // Log individual comment data to track available profile information
      console.log("getFormattedComments: Processing comment", {
        hasUniqueId: !!uniqueId,
        authorFields: {
          avatarThumb: comment.avatarThumb,
          avatarMedium: comment.avatarMedium,
          avatarLarge: comment.avatarLarge,
          profilePicture: comment.profilePicture,
        },
        commentText: text?.slice(0, 50),
      });

      const post = posts.find((ele) => ele.post_url === videoWebUrl);
      if (post && uniqueId) {
        const formattedComment: FormattedComment = {
          comment: text,
          username: uniqueId,
          commented_at: new Date(createTime).toISOString(),
          post_id: post.id,
          profile_url: `https://tiktok.com/@${uniqueId}`,
          // Add avatar field if available
          avatar:
            comment.avatarLarge ||
            comment.avatarMedium ||
            comment.avatarThumb ||
            comment.profilePicture,
        };

        // Log the formatted comment to verify avatar inclusion
        console.log("getFormattedComments: Formatted comment", {
          username: formattedComment.username,
          hasAvatar: !!formattedComment.avatar,
          avatarUrl: formattedComment.avatar,
          postId: formattedComment.post_id,
        });

        return formattedComment;
      }

      return null;
    }) || [];

  const validComments = comments.filter(
    (comment: FormattedComment) => comment !== null
  );

  console.log("getFormattedComments: Formatting complete", {
    totalComments: data?.length || 0,
    validComments: validComments.length,
    commentsWithAvatar: validComments.filter((c: FormattedComment) => c.avatar)
      .length,
    sampleAvatarUrls: validComments.slice(0, 3).map((c: FormattedComment) => ({
      username: c.username,
      hasAvatar: !!c.avatar,
      avatarUrl: c.avatar,
    })),
  });

  return validComments;
};

export default getFormattedComments;
