import { Database } from "../../types/database.types";
import processPlatform from "./processPlatform";
import { normalizePlatform } from "../utils/normalizePlatform";

type SocialType = Database["public"]["Enums"]["social_type"];

type HandlesConfig = {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  spotify?: string;
};

/**
 * Process multiple platforms for an agent
 */
const processPlatforms = async (
  agentId: string,
  handles: HandlesConfig,
  artistId?: string
): Promise<void> => {
  console.log("[INFO] Processing platforms:", {
    agentId,
    platforms: Object.keys(handles).filter((k) =>
      handles[k as keyof HandlesConfig]?.trim()
    ),
  });

  // Process platforms sequentially to avoid rate limiting
  for (const [platform, handle] of Object.entries(handles)) {
    if (handle?.trim()) {
      const normalizedPlatform = normalizePlatform(platform);
      await processPlatform(agentId, normalizedPlatform, handle, artistId);
    }
  }

  console.log("[INFO] Completed processing all platforms:", {
    agentId,
    platforms: Object.keys(handles).filter((k) =>
      handles[k as keyof HandlesConfig]?.trim()
    ),
  });
};

export default processPlatforms;
