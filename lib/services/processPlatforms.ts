import processPlatform from "./processPlatform";
import { normalizePlatform } from "../utils/normalizePlatform";

type HandlesConfig = {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  spotify?: string;
};

/**
 * Process multiple platforms for an agent in parallel
 */
const processPlatforms = async (
  agentId: string,
  handles: HandlesConfig,
  artistId?: string
): Promise<void> => {
  const validPlatforms = Object.entries(handles).filter(([_, handle]) =>
    handle?.trim()
  );

  console.log("[INFO] Starting parallel platform processing:", {
    agentId,
    platforms: validPlatforms.map(([platform]) => platform),
  });

  try {
    await Promise.all(
      validPlatforms.map(async ([platform, handle]) => {
        const normalizedPlatform = normalizePlatform(platform);
        try {
          await processPlatform(agentId, normalizedPlatform, handle!, artistId);
        } catch (error) {
          console.error("[ERROR] Platform processing failed:", {
            agentId,
            platform,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      })
    );

    console.log("[INFO] Completed parallel platform processing:", {
      agentId,
      platforms: validPlatforms.map(([platform]) => platform),
    });
  } catch (error) {
    console.error("[ERROR] Critical error in parallel platform processing:", {
      agentId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default processPlatforms;
