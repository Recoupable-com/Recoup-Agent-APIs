import { createAgentStatus } from "./createAgentStatus";

const beginAnalysis = async (
  pilotId: string,
  socialId: string
): Promise<{
  agentStatus: any;
  error: Error | null;
}> => {
  try {
    // Create agent status record
    const { agentStatus, error: statusError } = await createAgentStatus(
      pilotId,
      socialId
    );

    if (statusError) {
      console.error("Failed to create agent status:", statusError);
      return {
        agentStatus: null,
        error: new Error("Failed to create agent status record"),
      };
    }

    return { agentStatus, error: null };
  } catch (error) {
    console.error("Error in beginAnalysis:", error);
    return {
      agentStatus: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error in beginAnalysis"),
    };
  }
};

export default beginAnalysis;
