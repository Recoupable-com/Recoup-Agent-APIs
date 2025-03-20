import { STEP_OF_AGENT } from "../step";
import { Database } from "../../types/database.types";
import {
  AgentService as IAgentService,
  AgentServiceResult,
  CreateSocialResult,
  StoreSocialDataParams,
} from "../types/agent.types";
import { ScrapedProfile, ScrapedComment } from "../scraping/types";
import setArtistImage from "../supabase/setArtistImage";
import connectSocialToArtist from "../supabase/connectSocialToArtist";
import updateAgentStatus from "../supabase/updateAgentStatus";
import connectPostsToSocial from "../supabase/connectPostsToSocial";
import setNewPosts from "../supabase/setNewPosts";
import createSocial from "../supabase/createSocial";
import updateSocial from "../supabase/updateSocial";
import savePostComments from "../supabase/savePostComments";
import getAgentStatus from "../supabase/getAgentStatus";

type DbSocial = Database["public"]["Tables"]["socials"]["Row"];
type DbPost = Database["public"]["Tables"]["posts"]["Row"];
type DbPostComment = Database["public"]["Tables"]["post_comments"]["Row"];
type DbAgent = Database["public"]["Tables"]["agents"]["Row"];
type DbAgentStatus = Database["public"]["Tables"]["agent_status"]["Row"];

// Helper function to get platform from profile URL
const getPlatformFromUrl = (url: string): string => {
  if (url.includes("instagram.com")) return "Instagram";
  if (url.includes("twitter.com")) return "Twitter";
  if (url.includes("x.com")) return "Twitter";
  if (url.includes("tiktok.com")) return "TikTok";
  if (url.includes("spotify.com")) return "Spotify";
  return "Unknown";
};

export class AgentService implements IAgentService {
  async createSocial(profile: ScrapedProfile): Promise<CreateSocialResult> {
    const platform = getPlatformFromUrl(profile.profile_url);
    console.log("[DEBUG] Creating social record:", {
      platform,
      username: profile.username.substring(0, 3) + "...",
      profileFields: Object.keys(profile),
    });

    try {
      const socialData = {
        username: profile.username,
        profile_url: profile.profile_url,
        avatar: profile.avatar || null,
        followerCount: profile.followerCount || null,
        bio: profile.description || null,
      };

      const result = await createSocial(socialData);

      if (result.error) {
        console.error("[ERROR] Failed to create social record:", {
          platform,
          error:
            result.error instanceof Error
              ? {
                  message: result.error.message,
                  stack: result.error.stack,
                }
              : String(result.error),
          username: profile.username.substring(0, 3) + "...",
        });
      } else {
        console.log("[DEBUG] Social record created successfully:", {
          platform,
          socialId: result.social?.id,
          username: profile.username.substring(0, 3) + "...",
        });
      }

      return result;
    } catch (error) {
      console.error("[ERROR] Error in createSocial:", {
        platform,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : String(error),
        username: profile.username.substring(0, 3) + "...",
      });
      return {
        social: null,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error in createSocial"),
      };
    }
  }

  async updateSocial(
    socialId: string,
    profile: ScrapedProfile
  ): Promise<AgentServiceResult<DbSocial>> {
    const platform = getPlatformFromUrl(profile.profile_url);
    console.log("[DEBUG] Updating social record:", {
      platform,
      socialId,
      username: profile.username.substring(0, 3) + "...",
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
          username: profile.username.substring(0, 3) + "...",
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
        username: profile.username.substring(0, 3) + "...",
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

  async storeComments(
    comments: ScrapedComment[],
    socialId: string
  ): Promise<AgentServiceResult<DbPostComment[]>> {
    // Get platform from the first comment's post URL if available
    const platform =
      comments.length > 0
        ? getPlatformFromUrl(comments[0].post_url)
        : "Unknown";

    console.log("[DEBUG] Storing comments:", {
      platform,
      socialId,
      commentCount: comments.length,
    });

    try {
      await savePostComments(
        comments.map((comment) => ({
          text: comment.comment,
          timestamp: comment.commented_at,
          ownerUsername: comment.username,
          postUrl: comment.post_url,
        }))
      );

      console.log("[DEBUG] Comments stored successfully:", {
        platform,
        socialId,
        commentCount: comments.length,
      });

      // Since savePostComments doesn't return the stored comments,
      // we'll consider success as an empty array for now
      return { data: [], error: null };
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
        socialId,
        commentCount: comments.length,
      });
      return {
        data: null,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error storing comments"),
      };
    }
  }

  async storeSocialData(params: StoreSocialDataParams): Promise<
    AgentServiceResult<{
      social: DbSocial;
      posts: DbPost[];
      comments: DbPostComment[];
    }>
  > {
    const { agentStatusId, profile, posts, comments, artistId } = params;
    const platform = getPlatformFromUrl(profile.profile_url);

    console.log("[INFO] Starting social data storage:", {
      platform,
      agentStatusId,
      username: profile.username.substring(0, 3) + "...",
      dataStats: {
        posts: posts.length,
        comments: comments.length,
      },
      hasArtistId: !!artistId,
    });

    try {
      // Create social record
      console.log("[DEBUG] Creating social record:", {
        platform,
        username: profile.username.substring(0, 3) + "...",
      });

      const { social, error: socialError } = await this.createSocial(profile);
      if (socialError || !social) {
        console.error("[ERROR] Failed to create social record:", {
          platform,
          error:
            socialError instanceof Error
              ? {
                  message: socialError.message,
                  stack: socialError.stack,
                }
              : String(socialError),
        });
        return {
          data: null,
          error: socialError || new Error("Failed to create social"),
        };
      }

      // Handle artist-related operations if artistId is provided
      if (artistId) {
        console.log("[DEBUG] Setting up artist:", {
          platform,
          artistId,
          socialId: social.id,
        });

        await updateAgentStatus(agentStatusId, STEP_OF_AGENT.SETTING_UP_ARTIST);
        const newImage = await setArtistImage(artistId, profile.avatar || null);
        await this.updateSocial(social.id, { ...profile, avatar: newImage });
        await connectSocialToArtist(artistId, social);

        console.log("[DEBUG] Artist setup completed:", {
          platform,
          artistId,
          socialId: social.id,
        });
      }

      // Store posts
      console.log("[DEBUG] Storing posts:", {
        platform,
        count: posts.length,
        socialId: social.id,
        urls: posts.map((p) => p.post_url),
      });

      await updateAgentStatus(agentStatusId, STEP_OF_AGENT.POSTURLS);

      const { data: stored_posts, error: postsError } = await setNewPosts(
        posts.map((p) => p.post_url)
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
          socialId: social.id,
        });

        await updateAgentStatus(agentStatusId, STEP_OF_AGENT.MISSING_POSTS);
        return {
          data: null,
          error: postsError || new Error("Failed to store posts"),
        };
      }

      // Connect posts to social
      console.log("[DEBUG] Connecting posts to social:", {
        platform,
        socialId: social.id,
        postCount: posts.length,
      });

      await connectPostsToSocial(
        social,
        posts.map((post) => post.post_url)
      );

      // Store comments - Optimized to use a single database call
      console.log("[DEBUG] Processing comments for storage:", {
        platform,
        totalComments: comments.length,
        socialId: social.id,
      });

      const validPostUrls = new Set(stored_posts.map((post) => post.post_url));
      const validComments = comments.filter((comment) =>
        validPostUrls.has(comment.post_url)
      );

      console.log("[DEBUG] Filtered valid comments:", {
        platform,
        totalComments: comments.length,
        validComments: validComments.length,
        invalidComments: comments.length - validComments.length,
        socialId: social.id,
      });

      if (validComments.length > 0) {
        const { data: comments_result, error: commentsError } =
          await this.storeComments(validComments, social.id);

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
            socialId: social.id,
          });
          // Continue execution even if comments storage fails
        }

        console.log("[INFO] Social data storage completed successfully:", {
          platform,
          socialId: social.id,
          stats: {
            posts: stored_posts.length,
            comments: comments_result?.length || 0,
          },
        });

        return {
          data: {
            social,
            posts: stored_posts,
            comments: comments_result || [],
          },
          error: null,
        };
      }

      // Return success even if there were no comments to store
      console.log("[INFO] Social data storage completed (no comments):", {
        platform,
        socialId: social.id,
        stats: {
          posts: stored_posts.length,
          comments: 0,
        },
      });

      return {
        data: {
          social,
          posts: stored_posts,
          comments: [],
        },
        error: null,
      };
    } catch (error) {
      console.error("[ERROR] Error in storeSocialData:", {
        platform,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : String(error),
        agentStatusId,
      });
      return {
        data: null,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error in storeSocialData"),
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
