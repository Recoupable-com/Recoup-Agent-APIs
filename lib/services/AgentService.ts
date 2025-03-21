import { Database } from "../../types/database.types";
import {
  AgentService as IAgentService,
  AgentServiceResult,
} from "../types/agent.types";
import { ScrapedProfile, ScrapedComment, ScrapedPost } from "../scraping/types";
import setArtistImage from "../supabase/setArtistImage";
import connectSocialToArtist from "../supabase/connectSocialToArtist";
import connectPostsToSocial from "../supabase/connectPostsToSocial";
import setNewPosts from "../supabase/setNewPosts";
import updateSocial from "../supabase/updateSocial";
import savePostComments from "../supabase/savePostComments";
import getAgentStatus from "../supabase/getAgentStatus";
import getPlatformFromUrl from "../utils/getPlatformFromUrl";

type DbSocial = Database["public"]["Tables"]["socials"]["Row"];
type DbPost = Database["public"]["Tables"]["posts"]["Row"];
type DbPostComment = Database["public"]["Tables"]["post_comments"]["Row"];
type DbAgent = Database["public"]["Tables"]["agents"]["Row"];
type DbAgentStatus = Database["public"]["Tables"]["agent_status"]["Row"];

export class AgentService implements IAgentService {
  async updateSocial(
    socialId: string,
    profile: ScrapedProfile
  ): Promise<AgentServiceResult<DbSocial>> {
    const platform = getPlatformFromUrl(profile.profile_url);
    console.log("[DEBUG] Updating social record:", {
      platform,
      socialId,
      username: profile.username,
      updatedFields: Object.keys(profile),
    });

    try {
      const { error: updateError } = await updateSocial(socialId, {
        avatar: profile.avatar || null,
        followerCount: profile.followerCount || null,
        followingCount: profile.followingCount || null,
        bio: profile.description || null,
        id: socialId,
        profile_url: profile.profile_url,
        region: profile.region || null,
        updated_at: new Date().toISOString(),
        username: profile.username,
      });

      if (updateError) {
        console.error("[ERROR] Failed to update social record:", {
          platform,
          error:
            updateError instanceof Error
              ? {
                  message: updateError.message,
                  stack: updateError.stack,
                }
              : String(updateError),
          socialId,
          username: profile.username,
        });
        return {
          data: null,
          error: updateError,
        };
      }

      console.log("[DEBUG] Social record updated successfully:", {
        platform,
        socialId,
        username: profile.username.substring(0, 21) + "...",
      });

      // Since updateSocial doesn't return the updated record,
      // we'll consider success as null data with no error
      return { data: null, error: null };
    } catch (error) {
      console.error("[ERROR] Error in updateSocial:", {
        platform,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : String(error),
        socialId,
        username: profile.username,
      });
      return {
        data: null,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error updating social"),
      };
    }
  }

  async setupArtist(params: {
    artistId?: string;
    social: DbSocial;
    profile: ScrapedProfile;
  }): Promise<AgentServiceResult<void>> {
    const platform = getPlatformFromUrl(params.profile.profile_url);
    console.log("[DEBUG] Setting up social/artist:", {
      platform,
      artistId: params.artistId,
      socialId: params.social.id,
    });

    try {
      await this.updateSocial(params.social.id, params.profile);

      if (params.artistId) {
        const newImage = await setArtistImage(
          params.artistId,
          params.profile.avatar || null
        );
        await this.updateSocial(params.social.id, {
          ...params.profile,
          avatar: newImage,
        });
        await connectSocialToArtist(params.artistId, params.social);

        console.log("[DEBUG] Artist setup completed:", {
          platform,
          artistId: params.artistId,
          socialId: params.social.id,
        });
      } else {
        console.log("[DEBUG] Social update completed:", {
          platform,
          socialId: params.social.id,
        });
      }

      return { data: undefined, error: null };
    } catch (error) {
      console.error("[ERROR] Failed to setup social/artist:", {
        platform,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : String(error),
        artistId: params.artistId,
        socialId: params.social.id,
      });

      return {
        data: null,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to setup social/artist"),
      };
    }
  }

  async storePosts(params: {
    socialId: string;
    posts: ScrapedPost[];
  }): Promise<AgentServiceResult<DbPost[]>> {
    const platform = getPlatformFromUrl(params.posts[0].post_url);
    console.log("[DEBUG] Storing posts:", {
      platform,
      count: params.posts.length,
      socialId: params.socialId,
      urls: params.posts.map((p) => p.post_url),
    });

    try {
      const { data: stored_posts, error: postsError } = await setNewPosts(
        params.posts.map((p) => p.post_url)
      );

      if (postsError || !stored_posts) {
        console.error("[ERROR] Failed to store posts:", {
          platform,
          error:
            postsError instanceof Error
              ? {
                  message: postsError.message,
                  stack: postsError.stack,
                }
              : String(postsError),
          socialId: params.socialId,
        });

        return {
          data: null,
          error: postsError || new Error("Failed to store posts"),
        };
      }

      // Connect posts to social
      console.log("[DEBUG] Connecting posts to social:", {
        platform,
        socialId: params.socialId,
        postCount: params.posts.length,
      });

      await connectPostsToSocial(
        params.socialId,
        params.posts.map((post) => post.post_url)
      );

      return { data: stored_posts, error: null };
    } catch (error) {
      console.error("[ERROR] Failed to store posts:", {
        platform,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : String(error),
        socialId: params.socialId,
      });

      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Failed to store posts"),
      };
    }
  }

  async storeComments(params: {
    social: DbSocial;
    comments: ScrapedComment[];
    posts: DbPost[];
    socialMap: { [username: string]: string };
  }): Promise<AgentServiceResult<DbPostComment[]>> {
    const platform = getPlatformFromUrl(params.social.profile_url);
    console.log("[DEBUG] Processing comments for storage:", {
      platform,
      totalComments: params.comments.length,
      socialId: params.social.id,
    });

    try {
      // Filter comments based on valid post IDs
      const validPostUrls = new Set(params.posts.map((post) => post.post_url));
      const validComments = params.comments.filter((comment) =>
        validPostUrls.has(comment.post_url)
      );

      console.log("[DEBUG] Filtered valid comments:", {
        platform,
        totalComments: params.comments.length,
        validComments: validComments.length,
        invalidComments: params.comments.length - validComments.length,
        socialId: params.social.id,
      });

      if (validComments.length === 0) {
        return { data: [], error: null };
      }

      const { data: storedComments, error: commentsError } =
        await savePostComments({
          comments: validComments.map((comment) => ({
            text: comment.comment,
            timestamp: comment.commented_at,
            ownerUsername: comment.username,
            postUrl: comment.post_url,
          })),
          socialMap: params.socialMap,
        });

      if (commentsError) {
        console.error("[ERROR] Failed to store comments:", {
          platform,
          error:
            commentsError instanceof Error
              ? {
                  message: commentsError.message,
                  stack: commentsError.stack,
                }
              : String(commentsError),
          socialId: params.social.id,
        });
        return { data: null, error: commentsError };
      }

      console.log("[DEBUG] Comments stored successfully:", {
        platform,
        socialId: params.social.id,
        commentCount: storedComments?.length || 0,
      });

      return { data: storedComments || [], error: null };
    } catch (error) {
      console.error("[ERROR] Failed to store comments:", {
        platform,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : String(error),
        socialId: params.social.id,
      });

      return {
        data: null,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to store comments"),
      };
    }
  }

  async getAgentStatus(agentId: string): Promise<
    AgentServiceResult<{
      agent: DbAgent;
      statuses: DbAgentStatus[];
    }>
  > {
    console.log("[DEBUG] Getting agent status:", {
      agentId,
    });

    try {
      const result = await getAgentStatus(agentId);

      if (result.error || !result.data) {
        console.error("[ERROR] Failed to get agent status:", {
          error:
            result.error instanceof Error
              ? {
                  message: result.error.message,
                  stack: result.error.stack,
                }
              : String(result.error),
          agentId,
        });
        return {
          data: null,
          error: result.error || new Error("Failed to get agent status"),
        };
      }

      console.log("[DEBUG] Retrieved agent status:", {
        agentId,
        statusCount: result.data.statuses.length,
      });

      return { data: result.data, error: null };
    } catch (error) {
      console.error("[ERROR] Error in getAgentStatus:", {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : String(error),
        agentId,
      });
      return {
        data: null,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error in getAgentStatus"),
      };
    }
  }
}
