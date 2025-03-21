import { AgentService } from "../services/AgentService";
import { Database } from "../../types/database.types";
import { STEP_OF_AGENT } from "../step";
import updateAgentStatus from "./updateAgentStatus";

type DbAgentStatus = Database["public"]["Tables"]["agent_status"]["Row"];

/**
 * Update all agent statuses for an agent to a new status
 */
const updateAllAgentStatuses = async (
  agentId: string,
  status: STEP_OF_AGENT
): Promise<void> => {
  console.log("[DEBUG] Updating all agent statuses:", {
    agentId,
    newStatus: STEP_OF_AGENT[status],
  });

  const agentService = new AgentService();
  const { data } = await agentService.getAgentStatus(agentId);
  if (!data) {
    console.warn("[WARN] No agent status data found for update:", {
      agentId,
    });
    return;
  }

  await Promise.all(
    data.statuses.map((agentStatus: DbAgentStatus) =>
      updateAgentStatus(agentStatus.id, status)
    )
  );

  console.log("[DEBUG] Updated all agent statuses:", {
    agentId,
    newStatus: STEP_OF_AGENT[status],
    updatedStatusCount: data.statuses.length,
  });
};

export default updateAllAgentStatuses;
