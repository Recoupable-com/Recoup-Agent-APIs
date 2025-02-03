import { Address, getAddress } from "viem";
import getStackClient from "./getStackClient";
import { AGENT_RUN, CHAT_POINT_SYSTEM_ID } from "../consts";

const getAgents = async (agentId: string, address: Address) => {
  const stackClient = getStackClient(CHAT_POINT_SYSTEM_ID);

  const agentsInfo: any = await stackClient.getEvents({
    query: stackClient
      .eventsQuery()
      .where({
        eventType: `${AGENT_RUN}-${agentId}`,
        associatedAccount: getAddress(address),
      })
      .limit(1)
      .offset(0)
      .build(),
  });

  if (agentsInfo.length) {
    if (agentsInfo[0]?.metadata?.segments?.length)
      return {
        segments: agentsInfo[0].metadata.segments,
        commentIds: agentsInfo[0].metadata.commentIds,
      };
  }

  return {
    segments: [],
    commentIds: [],
  };
};

export default getAgents;
