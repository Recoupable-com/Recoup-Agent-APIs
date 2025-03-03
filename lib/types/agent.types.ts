import { Agent, AgentStatus, Post, Social } from "../../types/agent";
import { ScrapedProfile, ScrapedPost, ScrapedComment } from "../scraping/types";

export interface AgentServiceResult<T> {
  data: T | null;
  error: Error | null;
}

export interface CreateAgentResult {
  agent: Agent | null;
  error: Error | null;
}

export interface CreateSocialResult {
  social: Social | null;
  error: Error | null;
}

export interface CreateAgentStatusResult {
  agent_status: AgentStatus | null;
  error: Error | null;
}

export interface StoreSocialDataParams {
  agentStatusId: string;
  profile: ScrapedProfile;
  posts: ScrapedPost[];
  comments: ScrapedComment[];
  artistId?: string;
}

export interface AgentService {
  // Social operations
  createSocial(profile: ScrapedProfile): Promise<CreateSocialResult>;
  updateSocial(
    socialId: string,
    profile: ScrapedProfile
  ): Promise<AgentServiceResult<Social>>;

  // Data storage operations
  storeComments(
    comments: ScrapedComment[],
    postId: string,
    socialId: string
  ): Promise<AgentServiceResult<Comment[]>>;

  // Composite operations
  storeSocialData(params: StoreSocialDataParams): Promise<
    AgentServiceResult<{
      social: Social;
      posts: Post[];
      comments: Comment[];
    }>
  >;
}
