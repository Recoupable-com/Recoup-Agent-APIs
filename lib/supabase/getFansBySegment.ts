import supabase from "./serverClient";
import { Database } from "../../types/database.types";

interface FansBySegmentResponse {
  fanSocialIds: string[];
  error: Error | null;
}

const getFansBySegment = async (
  segmentId: string
): Promise<FansBySegmentResponse> => {
  console.log("[DEBUG] Fetching fans for segment", segmentId);

  try {
    const { data, error } = await supabase
      .from("fan_segments")
      .select("fan_social_id")
      .eq("segment_id", segmentId);

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
