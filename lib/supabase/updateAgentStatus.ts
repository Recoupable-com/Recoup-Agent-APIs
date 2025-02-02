import supabase from "./serverClient";

const updateAgentStatus = async (
  agent_status_id: string,
  status: number,
  progress: number = 0,
) => {
  const { data: agent_status } = await supabase
    .from("agent_status")
    .select("*")
    .eq("id", agent_status_id)
    .single();

  await supabase
    .from("agent_status")
    .update({
      ...agent_status,
      status,
      progress: agent_status.progress || progress,
    })
    .eq("id", agent_status_id)
    .select("*");
};

export default updateAgentStatus;
