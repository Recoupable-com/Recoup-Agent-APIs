import { z } from "zod";
import { tool } from "ai";
import { searchPerplexity } from "./searchPerplexity";
import { formatSearchResultsAsMarkdown } from "./formatSearchResultsAsMarkdown";

const searchWebTool = tool({
  description:
    "DEFAULT TOOL: Use this tool FIRST for any information you're unsure about. " +
    "NEVER respond with 'I can't find X', 'I don't have access to X', or 'I do not know X'. " +
    "This tool searches the web for real-time information and should be your go-to resource. " +
    "Returns ranked web search results with titles, URLs, and content snippets.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    max_results: z
      .number()
      .optional()
      .describe("Maximum number of results (1-20, default: 10)"),
    country: z
      .string()
      .optional()
      .describe("ISO country code for regional results (e.g., 'US', 'GB')"),
  }),
  execute: async function ({ query, max_results, country }) {
    if (!query) {
      throw new Error("Search query is required");
    }

    try {
      // Use Perplexity Search API
      const searchResponse = await searchPerplexity({
        query,
        max_results: max_results || 10,
        max_tokens_per_page: 1024,
        ...(country && { country }),
      });

      // Format results for the AI to read
      const formattedResults = formatSearchResultsAsMarkdown(searchResponse);

      return {
        content: [{ type: "text", text: formattedResults }],
        isError: false,
      };
    } catch (error) {
      throw new Error(`Search failed: ${error}`);
    }
  },
});

export default searchWebTool;
