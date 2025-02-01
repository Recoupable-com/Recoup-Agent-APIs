import supabase from "./serverClient";
import type { Database } from "../../types/database.types";
import { STEP_OF_ANALYSIS } from "../step";

type AgentStatus = Database["public"]["Tables"]["agent_status"]["Row"];

export const createAgentStatus = async (
  agentId: string,
  socialId: string
): Promise<{
  agentStatus: AgentStatus | null;
  error: Error | null;
}> => {
  try {
    const { data: agentStatus, error: statusError } = await supabase
      .from("agent_status")
      .insert({
        agent_id: agentId,
        social_id: socialId,
        status: STEP_OF_ANALYSIS.INITIAL,
        progress: STEP_OF_ANALYSIS.INITIAL,
      })
      .select()
      .single();

    if (statusError) {
      console.error("Failed to create agent status:", statusError);
      return {
        agentStatus: null,
        error: new Error("Failed to create agent status record"),
      };
    }

    return { agentStatus, error: null };
  } catch (error) {
    console.error("Error creating agent status:", error);
    return {
      agentStatus: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error creating agent status"),
    };
  }
};
