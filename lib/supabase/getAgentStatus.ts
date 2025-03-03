import { Database } from "../../types/database.types";
import supabase from "./serverClient";

type DbAgent = Database["public"]["Tables"]["agents"]["Row"];
type DbAgentStatus = Database["public"]["Tables"]["agent_status"]["Row"];

const getAgentStatus = async (
  agentId: string
): Promise<{
  data: {
    agent: DbAgent;
    statuses: DbAgentStatus[];
  } | null;
  error: Error | null;
}> => {
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
};

export default getAgentStatus;
