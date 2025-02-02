import {
  CHAT_POINT_SYSTEM_ID,
  MESSAGE_SENT_EVENT,
  MESSAGE_SENT_POINT,
} from "../consts";
import getStackClient from "./getStackClient";

const trackAgentEvent = async (
  address: string | null,
  username: string,
  accountId: string,
  pilotId: string,
  agentName: string,
) => {
  try {
    const stackClient = getStackClient(CHAT_POINT_SYSTEM_ID);
    const uniqueId = `${address}-${Date.now()}`;
    const eventName = `${MESSAGE_SENT_EVENT}-${pilotId}`;
    await stackClient.track(eventName, {
      points: MESSAGE_SENT_POINT,
      account: address || "",
      uniqueId,
      metadata: {
        conversationId: pilotId,
        accountId,
        title: `${agentName} Analysis: ${username}`,
        agent_name: agentName,
      },
    });
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export default trackAgentEvent;
