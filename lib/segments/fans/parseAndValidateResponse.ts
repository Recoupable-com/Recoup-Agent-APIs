/**
 * Result of parsing and validating an LLM response
 */
export interface ParseResult {
  success: boolean;
  batchResults?: any[];
  error?: Error;
}

/**
 * Parses and validates the LLM response
 *
 * @param response - The raw response from the LLM
 * @param batchIndex - The index of the current batch for logging
 * @returns Object containing parse results and status
 */
export const parseAndValidateResponse = (
  response: string,
  batchIndex: number
): ParseResult => {
  // Clean and validate response
  const cleanedResponse = response.replace(/```json\n?|```/g, "").trim();

  // Validate response structure before parsing
  if (!cleanedResponse.startsWith("[") || !cleanedResponse.endsWith("]")) {
    console.error(`[ERROR] Incomplete JSON array in batch ${batchIndex + 1}:`, {
      startsWithBracket: cleanedResponse.startsWith("["),
      endsWithBracket: cleanedResponse.endsWith("]"),
      firstChars: cleanedResponse.substring(0, 100),
      lastChars: cleanedResponse.substring(cleanedResponse.length - 100),
    });
    return {
      success: false,
      error: new Error("Invalid response format"),
    };
  }

  try {
    const batchResults = JSON.parse(cleanedResponse);

    // Validate batch results structure
    if (!Array.isArray(batchResults)) {
      console.error(
        `[ERROR] Invalid batch results structure for batch ${batchIndex + 1}:`,
        {
          type: typeof batchResults,
          isArray: Array.isArray(batchResults),
        }
      );
      return {
        success: false,
        error: new Error("Invalid batch results structure"),
      };
    }

    return {
      success: true,
      batchResults,
    };
  } catch (error: any) {
    // Handle JSON parse error with more detailed logging
    if (error instanceof SyntaxError) {
      const positionMatch = error.message.match(/position (\d+)/);
      const position = positionMatch?.[1];
      const nearbyContent = position
        ? cleanedResponse.substring(
            Math.max(0, Number(position) - 100),
            Math.min(cleanedResponse.length, Number(position) + 100)
          )
        : "N/A";

      console.error(`[ERROR] JSON parse error in batch ${batchIndex + 1}:`, {
        error: error.message,
        position,
        nearbyContent,
        responseLength: cleanedResponse.length,
        isComplete:
          cleanedResponse.startsWith("[") && cleanedResponse.endsWith("]"),
      });
    } else {
      console.error(
        `[ERROR] Unexpected error in batch ${batchIndex + 1}:`,
        error
      );
    }

    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export default parseAndValidateResponse;
