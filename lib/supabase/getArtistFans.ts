import { Social } from "../../types/agent";
import { getArtistSegmentIds } from "./getArtistSegmentIds";
import { getFanSocialIds } from "./getFanSocialIds";
import { getSocialsByIds } from "./getSocialsByIds";

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
    // Get segment IDs for the artist
    const { status: segmentStatus, segmentIds } =
      await getArtistSegmentIds(artistAccountId);
    if (segmentStatus === "error" || !segmentIds.length) {
      return {
        status: segmentStatus,
        socials: [],
      };
    }

    // Get fan social IDs from segments
    const { status: socialIdsStatus, socialIds } =
      await getFanSocialIds(segmentIds);
    if (socialIdsStatus === "error" || !socialIds.length) {
      return {
        status: socialIdsStatus,
        socials: [],
      };
    }

    // Get social details
    const { status: socialsStatus, socials } = await getSocialsByIds(socialIds);
    return {
      status: socialsStatus,
      socials,
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
