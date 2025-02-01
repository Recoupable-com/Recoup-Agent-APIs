import supabase from "./serverClient";
import type { Database } from "../../types/database.types";

type Agent = Database["public"]["Tables"]["agents"]["Row"];

export const createAgent = async (): Promise<{
  agent: Agent | null;
  error: Error | null;
}> => {
  try {
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .insert({})
      .select()
      .single();

    if (agentError) {
      console.error("Failed to create agent:", agentError);
      return { agent: null, error: new Error("Failed to create agent record") };
    }

    return { agent, error: null };
  } catch (error) {
    console.error("Error creating agent:", error);
    return {
      agent: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error creating agent"),
    };
  }
};
