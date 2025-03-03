import supabase from "./serverClient";

interface FansBySegmentResponse {
  fanSocialIds: string[];
  error: Error | null;
}

const getFansBySegment = async (
  segmentId: string
): Promise<FansBySegmentResponse> => {
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
