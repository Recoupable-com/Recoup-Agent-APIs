import {
  DatabaseMapper,
  ScrapedProfile,
  ScrapedPost,
  ScrapedComment,
} from "./types";
import { Database } from "../../types/database.types";

type DbSocial = Database["public"]["Tables"]["socials"]["Row"];
type DbPost = Database["public"]["Tables"]["posts"]["Row"];
type DbPostComment = Database["public"]["Tables"]["post_comments"]["Row"];

export class DefaultDatabaseMapper implements DatabaseMapper {
  toDbSocial(profile: ScrapedProfile): Omit<DbSocial, "id" | "updated_at"> {
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

  toDbPost(post: ScrapedPost): Omit<DbPost, "id" | "updated_at"> {
    return {
      post_url: post.post_url,
    };
  }

  toDbComment(
    comment: ScrapedComment,
    postId: string,
    socialId: string
  ): Omit<DbPostComment, "id"> {
    return {
      comment: comment.comment,
      commented_at: comment.commented_at,
      post_id: postId,
      social_id: socialId,
    };
  }
}
