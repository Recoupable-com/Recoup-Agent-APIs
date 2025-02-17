import supabase from "./serverClient";
import { Database } from "../../types/database.types";

interface FansBySegmentResponse {
  fanSocialIds: string[];
  error: Error | null;
}

const getFansBySegment = async (
  artistSocialIds: string[],
  segmentName: string
): Promise<FansBySegmentResponse> => {
  console.log(
    "[DEBUG] Fetching fans for segment",
    segmentName,
    "across",
    artistSocialIds.length,
    "artist socials"
  );

  try {
    const { data, error } = await supabase
      .from("artist_fan_segments")
      .select("fan_social_id")
      .in("artist_social_id", artistSocialIds)
      .eq("segment_name", segmentName);

    if (error) {
      console.error("[ERROR] Failed to fetch fan segments:", error);
      return {
        fanSocialIds: [],
        error: new Error("Failed to fetch fan segments"),
      };
    }

    const fanSocialIds = data.map((f) => f.fan_social_id);
    console.log("[DEBUG] Found", fanSocialIds.length, "fans in segment");

    return { fanSocialIds, error: null };
  } catch (error) {
    console.error("[ERROR] Unexpected error in getFansBySegment:", error);
    return {
      fanSocialIds: [],
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default getFansBySegment;
