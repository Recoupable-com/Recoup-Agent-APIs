import { BaseMessage } from "@langchain/core/messages";
import { initializeAgent, AgentOptions } from "./initializeAgent.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Gets completions using LangGraph with Claude 3.7 Sonnet
 *
 * @param messages - Array of messages to send to the LLM
 * @param options - Options for the LangGraph agent
 * @returns The LLM response content
 */
export async function getLangGraphCompletions(
  messages: any[],
  options: AgentOptions = {}
): Promise<string> {
  try {
    const { agent } = initializeAgent(options);

    console.log("[LangGraph] Invoking agent with messages");

    const threadId = options.threadId || `segment-gen-${uuidv4()}`;
    console.log(`[LangGraph] Using thread_id: ${threadId}`);

    const result = await agent.invoke(
      {
        messages,
      },
      {
        configurable: {
          thread_id: threadId,
        },
      }
    );

    const resultMessages = result.messages as BaseMessage[];
    const lastMessage = resultMessages[resultMessages.length - 1];

    if (!lastMessage || !lastMessage.content) {
      throw new Error("No content in LangGraph response");
    }

    return lastMessage.content as string;
  } catch (error) {
    console.error("[LangGraph] Error getting completions:", error);
    throw error;
  }
}

export default getLangGraphCompletions;
