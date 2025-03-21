import { AgentService } from "../services/AgentService";
import { Database } from "../../types/database.types";
import { STEP_OF_AGENT } from "../step";

type DbAgentStatus = Database["public"]["Tables"]["agent_status"]["Row"];

/**
 * Check if all platforms for an agent have completed processing
 */
const areAllPlatformsComplete = async (agentId: string): Promise<boolean> => {
  console.log("[DEBUG] Checking platform completion status:", {
    agentId,
  });

  const agentService = new AgentService();
  const { data } = await agentService.getAgentStatus(agentId);
  if (!data) {
    console.warn("[WARN] No agent status data found:", {
      agentId,
    });
    return false;
  }

  const statusBreakdown = data.statuses.map((status: DbAgentStatus) => ({
    id: status.id,
    status: status.status !== null ? STEP_OF_AGENT[status.status] : "null",
    social_id: status.social_id,
    isComplete:
      status.status === STEP_OF_AGENT.FINISHED ||
      status.status === STEP_OF_AGENT.ERROR ||
      status.status === STEP_OF_AGENT.MISSING_POSTS ||
      status.status === STEP_OF_AGENT.RATE_LIMIT_EXCEEDED ||
      status.status === STEP_OF_AGENT.UNKNOWN_PROFILE,
  }));

  const isComplete = statusBreakdown.every((s) => s.isComplete);

  console.log("[DEBUG] Platform completion check result:", {
    agentId,
    isComplete,
    statusBreakdown,
  });

  return isComplete;
};

export default areAllPlatformsComplete;
