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
  updateSocial(
    socialId: string,
    profile: ScrapedProfile
  ): Promise<AgentServiceResult<DbSocial>>;

  // Artist operations
  setupArtist(params: {
    artistId: string;
    social: DbSocial;
    profile: ScrapedProfile;
  }): Promise<AgentServiceResult<void>>;

  // Post operations
  storePosts(params: {
    socialId: string;
    posts: ScrapedPost[];
  }): Promise<AgentServiceResult<DbPost[]>>;

  // Comment operations
  storeComments(params: {
    social: DbSocial;
    comments: ScrapedComment[];
    posts: DbPost[];
    socialMap: { [username: string]: string };
  }): Promise<AgentServiceResult<DbPostComment[]>>;
}
