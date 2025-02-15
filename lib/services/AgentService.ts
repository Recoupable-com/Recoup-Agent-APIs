import { STEP_OF_AGENT } from "../step";
import supabase from "../supabase/serverClient";
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
import createAgentStatus from "../supabase/createAgentStatus";
import updateAgentStatus from "../supabase/updateAgentStatus";
import connectPostsToSocial from "../supabase/connectPostsToSocial";
import setNewPosts from "../supabase/setNewPosts";

type DbSocial = Database["public"]["Tables"]["socials"]["Row"];
type DbPost = Database["public"]["Tables"]["posts"]["Row"];
type DbPostComment = Database["public"]["Tables"]["post_comments"]["Row"];
type DbAgent = Database["public"]["Tables"]["agents"]["Row"];
type DbAgentStatus = Database["public"]["Tables"]["agent_status"]["Row"];

export class AgentService implements IAgentService {
  async createSocial(profile: ScrapedProfile): Promise<CreateSocialResult> {
    try {
      // Check for existing social record
      const { data: existing, error: existingError } = await supabase
        .from("socials")
        .select("*")
        .eq("profile_url", profile.profile_url)
        .single();

      if (existingError && existingError.code !== "PGRST116") {
        // PGRST116 means no rows returned, which is fine
        console.error("Failed to check existing social:", existingError);
        return {
          social: null,
          error: new Error("Failed to check existing social record"),
        };
      }

      if (existing) {
        // Update existing record
        const { data: updated, error: updateError } = await supabase
          .from("socials")
          .update({
            username: profile.username,
            avatar: profile.avatar || null,
            followerCount: profile.followerCount || null,
            bio: profile.description || null,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (updateError) {
          console.error("Failed to update social:", updateError);
          return {
            social: null,
            error: new Error("Failed to update social record"),
          };
        }

        return { social: updated, error: null };
      }

      // Create new record
      const { data: social, error: socialError } = await supabase
        .from("socials")
        .insert({
          username: profile.username,
          profile_url: profile.profile_url,
          avatar: profile.avatar || null,
          followerCount: profile.followerCount || null,
          bio: profile.description || null,
        })
        .select()
        .single();

      if (socialError) {
        console.error("Failed to create social:", socialError);
        return {
          social: null,
          error: new Error("Failed to create social record"),
        };
      }

      return { social, error: null };
    } catch (error) {
      console.error("Error creating social:", error);
      return {
        social: null,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error creating social"),
      };
    }
  }

  async updateSocial(
    socialId: string,
    profile: ScrapedProfile
  ): Promise<AgentServiceResult<DbSocial>> {
    try {
      const { data: social, error: updateError } = await supabase
        .from("socials")
        .update({
          avatar: profile.avatar || null,
          followerCount: profile.followerCount || null,
          bio: profile.description || null,
        })
        .eq("id", socialId)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to update social:", updateError);
        return {
          data: null,
          error: new Error("Failed to update social record"),
        };
      }

      return { data: social, error: null };
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

  async storePosts(
    posts: ScrapedPost[]
  ): Promise<AgentServiceResult<DbPost[]>> {
    try {
      const { data: stored_posts, error: postsError } = await supabase
        .from("posts")
        .insert(
          posts.map((post) => ({
            post_url: post.post_url,
          }))
        )
        .select();

      if (postsError) {
        console.error("Failed to store posts:", postsError);
        return { data: null, error: new Error("Failed to store posts") };
      }

      return { data: stored_posts, error: null };
    } catch (error) {
      console.error("Error storing posts:", error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error storing posts"),
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
      const { data: stored_comments, error: commentsError } = await supabase
        .from("post_comments")
        .insert(
          comments.map((comment) => ({
            comment: comment.comment,
            commented_at: comment.commented_at,
            post_id: postId,
            social_id: socialId,
          }))
        )
        .select();

      if (commentsError) {
        console.error("Failed to store comments:", commentsError);
        return { data: null, error: new Error("Failed to store comments") };
      }

      return { data: stored_comments, error: null };
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
      // Get agent
      const { data: agent, error: agentError } = await supabase
        .from("agents")
        .select("*")
        .eq("id", agentId)
        .single();

      if (agentError || !agent) {
        console.error("Failed to get agent:", agentError);
        return {
          data: null,
          error: new Error("Agent not found"),
        };
      }

      // Get all statuses for this agent
      const { data: statuses, error: statusError } = await supabase
        .from("agent_status")
        .select("*")
        .eq("agent_id", agentId)
        .order("updated_at", { ascending: false });

      if (statusError) {
        console.error("Failed to get agent statuses:", statusError);
        return {
          data: null,
          error: new Error("Failed to get agent statuses"),
        };
      }

      return {
        data: {
          agent,
          statuses: statuses || [],
        },
        error: null,
      };
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
