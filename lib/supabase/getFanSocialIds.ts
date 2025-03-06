import supabase from "./serverClient";

interface GetFanSocialIdsResponse {
  status: string;
  socialIds: string[];
}

/**
 * Gets all unique fan social IDs for given segments
 * @param segmentIds Array of segment IDs to get fans for
 * @returns Array of unique fan social IDs
 */
export const getFanSocialIds = async (
  segmentIds: string[]
): Promise<GetFanSocialIdsResponse> => {
  try {
    if (!segmentIds.length) {
      return {
        status: "success",
        socialIds: [],
      };
    }

    const { data: fanSegments, error } = await supabase
      .from("fan_segments")
      .select("fan_social_id")
      .in("segment_id", segmentIds);

    if (error) {
      console.error("[ERROR] Error fetching fan_segments:", error);
      return {
        status: "error",
        socialIds: [],
      };
    }

    return {
      status: "success",
      socialIds: [...new Set(fanSegments?.map((fs) => fs.fan_social_id) || [])],
    };
  } catch (error) {
    console.error("[ERROR] Unexpected error in getFanSocialIds:", error);
    return {
      status: "error",
      socialIds: [],
    };
  }
};
