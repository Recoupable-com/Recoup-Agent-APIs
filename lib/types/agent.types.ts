import { Database } from "../../types/database.types";
import { ScrapedProfile, ScrapedPost, ScrapedComment } from "../scraping/types";

type DbSocial = Database["public"]["Tables"]["socials"]["Row"];
type DbPost = Database["public"]["Tables"]["posts"]["Row"];
type DbPostComment = Database["public"]["Tables"]["post_comments"]["Row"];
type DbAgent = Database["public"]["Tables"]["agents"]["Row"];
type DbAgentStatus = Database["public"]["Tables"]["agent_status"]["Row"];

export interface AgentServiceResult<T> {
  data: T | null;
  error: Error | null;
}

export interface CreateAgentResult {
  agent: DbAgent | null;
  error: Error | null;
}

export interface CreateSocialResult {
  social: DbSocial | null;
  error: Error | null;
}

export interface CreateAgentStatusResult {
  agent_status: DbAgentStatus | null;
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
  ): Promise<AgentServiceResult<DbSocial>>;

  // Data storage operations
  storePosts(posts: ScrapedPost[]): Promise<AgentServiceResult<DbPost[]>>;
  storeComments(
    comments: ScrapedComment[],
    postId: string,
    socialId: string
  ): Promise<AgentServiceResult<DbPostComment[]>>;

  // Composite operations
  storeSocialData(params: StoreSocialDataParams): Promise<
    AgentServiceResult<{
      social: DbSocial;
      posts: DbPost[];
      comments: DbPostComment[];
    }>
  >;
}
