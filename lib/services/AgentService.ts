import { STEP_OF_AGENT } from "../step";
import { Database } from "../../types/database.types";
import {
  AgentService as IAgentService,
  AgentServiceResult,
  CreateSocialResult,
  StoreSocialDataParams,
} from "../types/agent.types";
import { ScrapedProfile, ScrapedPost, ScrapedComment } from "../scraping/types";
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

export class AgentService implements IAgentService {
  async createSocial(profile: ScrapedProfile): Promise<CreateSocialResult> {
    try {
      const socialData = {
        username: profile.username,
        profile_url: profile.profile_url,
        avatar: profile.avatar || null,
        followerCount: profile.followerCount || null,
        bio: profile.description || null,
      };

      return await createSocial(socialData);
    } catch (error) {
      console.error("Error in AgentService.createSocial:", error);
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
    try {
      const { error: updateError } = await updateSocial(socialId, {
        avatar: profile.avatar || null,
        followerCount: profile.followerCount || null,
        bio: profile.description || null,
      });

      if (updateError) {
        console.error("Failed to update social:", updateError);
        return {
          data: null,
          error: updateError,
        };
      }

      // Since updateSocial doesn't return the updated record,
      // we'll consider success as null data with no error
      return { data: null, error: null };
    } catch (error) {
      console.error("Error updating social:", error);
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
    postId: string,
    socialId: string
  ): Promise<AgentServiceResult<DbPostComment[]>> {
    try {
      console.log("Storing comments for social", socialId);
      await savePostComments(
        comments.map((comment) => ({
          text: comment.comment,
          timestamp: comment.commented_at,
          ownerUsername: comment.username,
          postUrl: comment.post_url,
        }))
      );

      // Since savePostComments doesn't return the stored comments,
      // we'll consider success as an empty array for now
      return { data: [], error: null };
    } catch (error) {
      console.error("Error storing comments:", error);
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

    try {
      // Create social record
      console.log("Creating social record...");
      const { social, error: socialError } = await this.createSocial(profile);
      if (socialError || !social) {
        return {
          data: null,
          error: socialError || new Error("Failed to create social"),
        };
      }

      // Handle artist-related operations if artistId is provided
      if (artistId) {
        await updateAgentStatus(agentStatusId, STEP_OF_AGENT.SETTING_UP_ARTIST);
        const newImage = await setArtistImage(artistId, profile.avatar || null);
        await this.updateSocial(social.id, { ...profile, avatar: newImage });
        await connectSocialToArtist(artistId, social);
      }

      // Store posts
      console.log("Storing posts...");
      await updateAgentStatus(agentStatusId, STEP_OF_AGENT.POSTURLS);

      const { data: stored_posts, error: postsError } = await setNewPosts(
        posts.map((post) => post.post_url)
      );

      if (postsError || !stored_posts) {
        await updateAgentStatus(agentStatusId, STEP_OF_AGENT.MISSING_POSTS);
        return {
          data: null,
          error: postsError || new Error("Failed to store posts"),
        };
      }

      // Connect posts to social
      console.log("Connecting posts to social...");
      await connectPostsToSocial(
        social,
        posts.map((post) => post.post_url)
      );

      // Store comments
      console.log("Storing comments...");
      const stored_comments: DbPostComment[] = [];
      for (const post of stored_posts) {
        const postComments = comments.filter(
          (c) => c.post_url === post.post_url
        );
        if (postComments.length) {
          const { data: comments_result, error: commentsError } =
            await this.storeComments(postComments, post.id, social.id);
          if (commentsError || !comments_result) {
            console.error(
              `Failed to store comments for post ${post.post_url}:`,
              commentsError
            );
            continue;
          }
          stored_comments.push(...comments_result);
        }
      }

      console.log("Data stored successfully.");
      return {
        data: {
          social,
          posts: stored_posts,
          comments: stored_comments,
        },
        error: null,
      };
    } catch (error) {
      console.error("Error in storeSocialData:", error);
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
    try {
      const result = await getAgentStatus(agentId);

      if (result.error || !result.data) {
        console.error("Failed to get agent status:", result.error);
        return {
          data: null,
          error: result.error || new Error("Failed to get agent status"),
        };
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error("Error in getAgentStatus:", error);
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
