import supabase from "./serverClient.js";

const updateAgentStatus = async (
 agent_id: string,
 social_platform: string,
 status: number,
 progress: number = 0
) => {
  const { data: agent_status } = await supabase.from("agent_status").select("*").eq("agent_id", agent_id).eq("social_platform", social_platform).single();

  await supabase.from("agent_status").update({
    ...agent_status,
    status,
    progress: agent_status.progress || progress
  })
};

export default updateAgentStatus;
