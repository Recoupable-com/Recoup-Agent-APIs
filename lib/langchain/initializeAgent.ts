import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";

const AI_MODEL = "claude-3-7-sonnet-latest";

export interface AgentOptions {
  tools?: any[];
  messageModifier?: string;
  threadId?: string;
  maxTokens?: number;
}

export interface AgentResult {
  agent: ReturnType<typeof createReactAgent>;
  memory: MemorySaver;
}

/**
 * Initializes a LangGraph agent with Claude 3.7 Sonnet
 *
 * @param options - Options for configuring the agent
 * @returns The initialized agent and memory
 */
export const initializeAgent = (options: AgentOptions = {}): AgentResult => {
  console.log("[LangGraph] Initializing agent with Claude 3.7 Sonnet");

  const llm = new ChatAnthropic({
    modelName: AI_MODEL,
    maxTokens: options.maxTokens || 4096,
  });

  const memory = new MemorySaver();

  const agent = createReactAgent({
    llm,
    tools: options.tools || [],
    messageModifier: options.messageModifier || "",
    checkpointSaver: memory,
  });

  return { agent, memory };
};

export default initializeAgent;
