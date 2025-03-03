import {
  DatabaseMapper,
  ScrapedProfile,
  ScrapedPost,
  ScrapedComment,
} from "./types";
import { Comment, Post, Social } from "../../types/agent";

export class DefaultDatabaseMapper implements DatabaseMapper {
  toDbSocial(profile: ScrapedProfile): Omit<Social, "id" | "updated_at"> {
    return {
      username: profile.username,
      profile_url: profile.profile_url,
      avatar: profile.avatar || null,
      followerCount: profile.followerCount || null,
      bio: profile.description || null,
      region: null,
      followingCount: null,
    };
  }

  toDbPost(post: ScrapedPost): Omit<Post, "id" | "updated_at"> {
    return {
      post_url: post.post_url,
    };
  }

  toDbComment(
    comment: ScrapedComment,
    postId: string,
    socialId: string
  ): Omit<Comment, "id"> {
    return {
      comment: comment.comment,
      commented_at: comment.commented_at,
      post_id: postId,
      social_id: socialId,
    };
  }
}
