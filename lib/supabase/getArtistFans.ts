import { Social } from "../../types/agent";
import supabase from "./serverClient";

interface GetArtistFansResponse {
  status: string;
  socials: Social[];
}

/**
 * Gets all fans for an artist by joining artist_segments and fan_segments tables
 * @param artistAccountId The artist account ID to get fans for
 * @returns Object containing status and array of unique fan socials
 */
export const getArtistFans = async (
  artistAccountId: string
): Promise<GetArtistFansResponse> => {
  try {
    // First get all segments associated with the artist
    const { data: artistSegments, error: artistSegmentsError } = await supabase
      .from("artist_segments")
      .select("segment_id")
      .eq("artist_account_id", artistAccountId);

    if (artistSegmentsError) {
      console.error(
        "[ERROR] Error fetching artist_segments:",
        artistSegmentsError
      );
      return {
        status: "error",
        socials: [],
      };
    }

    if (!artistSegments?.length) {
      console.log(
        "[DEBUG] No segments found for artistAccountId:",
        artistAccountId
      );
      return {
        status: "success",
        socials: [],
      };
    }

    // Get all fan_segments for these segments
    const segmentIds = artistSegments.map((s) => s.segment_id);
    const { data: fanSegments, error: fanSegmentsError } = await supabase
      .from("fan_segments")
      .select("fan_social_id")
      .in("segment_id", segmentIds);

    if (fanSegmentsError) {
      console.error("[ERROR] Error fetching fan_segments:", fanSegmentsError);
      return {
        status: "error",
        socials: [],
      };
    }

    if (!fanSegments?.length) {
      console.log(
        "[DEBUG] No fans found in segments for artistAccountId:",
        artistAccountId
      );
      return {
        status: "success",
        socials: [],
      };
    }

    // Get unique social IDs
    const uniqueSocialIds = [
      ...new Set(fanSegments.map((fs) => fs.fan_social_id)),
    ];

    // Get all social records for these fans
    const { data: socials, error: socialsError } = await supabase
      .from("socials")
      .select(
        "id, username, avatar, profile_url, region, bio, followerCount, followingCount, updated_at"
      )
      .in("id", uniqueSocialIds);

    if (socialsError) {
      console.error("[ERROR] Error fetching socials:", socialsError);
      return {
        status: "error",
        socials: [],
      };
    }

    return {
      status: "success",
      socials: socials || [],
    };
  } catch (error) {
    console.error("[ERROR] Unexpected error in getArtistFans:", error);
    return {
      status: "error",
      socials: [],
    };
  }
};

export default getArtistFans;
