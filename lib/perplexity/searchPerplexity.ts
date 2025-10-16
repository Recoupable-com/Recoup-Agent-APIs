import {
  getPerplexityApiKey,
  getPerplexityHeaders,
  PERPLEXITY_BASE_URL,
} from "./config";

import {
  SearchResult,
  SearchResponse,
  SearchParams,
} from "../../types/perplexity.types";

export { SearchResult, SearchResponse, SearchParams };

export async function searchPerplexity(
  params: SearchParams
): Promise<SearchResponse> {
  const apiKey = getPerplexityApiKey();
  const url = `${PERPLEXITY_BASE_URL}/search`;

  const body = {
    query: params.query,
    max_results: params.max_results || 10,
    max_tokens_per_page: params.max_tokens_per_page || 1024,
    ...(params.country && { country: params.country }),
    ...(params.search_domain_filter && {
      search_domain_filter: params.search_domain_filter,
    }),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getPerplexityHeaders(apiKey),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Perplexity Search API error: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to search Perplexity API: ${error}`);
  }
}
