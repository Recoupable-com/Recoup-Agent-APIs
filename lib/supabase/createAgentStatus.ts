import { Database } from "../../types/database.types";
import supabase from "./serverClient";

type AgentStatus = Database["public"]["Tables"]["agent_status"]["Row"];

const createAgentStatus = async (
  agent_id: string,
  social_id: string,
  status: number,
): Promise<{
  agent_status: AgentStatus | null;
  error: Error | null;
}> => {
  try {
    const { data: existing_status } = await supabase
      .from("agent_status")
      .select("*")
      .eq("social_id", social_id)
      .eq("agent_id", agent_id)
      .single();
    if (existing_status) {
      const { data: updated_status, error: update_statis_error } =
        await supabase
          .from("agent_status")
          .update({
            ...existing_status,
            status,
          })
          .eq("id", agent_id)
          .select("*")
          .single();
      return { agent_status: updated_status, error: update_statis_error };
    }

    const { data: new_agent_status, error: new_agent_status_error } =
      await supabase
        .from("agent_status")
        .insert({
          agent_id,
          social_id,
          status,
          progress: 0,
        })
        .select("*")
        .single();

    return { agent_status: new_agent_status, error: new_agent_status_error };
  } catch (error) {
    console.error("Error creating social:", error);
    return {
      agent_status: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error creating social"),
    };
  }
};

export default createAgentStatus;
