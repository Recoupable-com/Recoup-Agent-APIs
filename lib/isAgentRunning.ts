import { STEP_OF_AGENT } from "./step";

const isAgentRunning = (agentsStatus: any) => {
  return agentsStatus.some(
    (agentStatus: any) => agentStatus.status > STEP_OF_AGENT.UNKNOWN_PROFILE,
  );
};

export default isAgentRunning;
