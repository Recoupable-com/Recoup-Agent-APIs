import { getAccountSocials } from "./getAccountSocials";
import getFansBySegment from "./getFansBySegment";
import getCommentsBySocialIds from "./getCommentsBySocialIds";

interface ArtistSegmentCommentsResponse {
  comments: string[];
  socialMetrics: {
    followerCount: number;
    username: string;
    avatar: string;
  };
}

const getArtistSegmentComments = async (
  artistId: string,
  segmentName: string
): Promise<ArtistSegmentCommentsResponse> => {
  console.log(
    "[DEBUG] Fetching segment comments for artist",
    artistId,
    "segment",
    segmentName
  );

  try {
    // 1. Get artist's social accounts
    const { status, socials } = await getAccountSocials(artistId);
    if (status === "error" || !socials.length) {
      throw new Error("Failed to fetch social accounts");
    }
    const socialIds = socials.map((s) => s.id);
    console.log("[DEBUG] Found", socialIds.length, "social accounts");

    // 2. Get fans in segment
    const { fanSocialIds, error: fansError } = await getFansBySegment(
      socialIds,
      segmentName
    );
    if (fansError) {
      throw fansError;
    }
    console.log("[DEBUG] Found", fanSocialIds.length, "fans in segment");

    // 3. Get comments from fans
    const { comments, error: commentsError } =
      await getCommentsBySocialIds(fanSocialIds);
    if (commentsError) {
      throw commentsError;
    }
    console.log("[DEBUG] Found", comments.length, "comments from fans");

    // 4. Aggregate social metrics
    const socialMetrics = {
      followerCount: socials.reduce(
        (sum, s) => sum + (s.followerCount || 0),
        0
      ),
      username: socials[0]?.username || "",
      avatar: socials[0]?.avatar || "",
    };

    return {
      comments,
      socialMetrics,
    };
  } catch (error) {
    console.error("[ERROR] Error in getArtistSegmentComments:", error);
    throw error instanceof Error
      ? error
      : new Error("Unknown error in getArtistSegmentComments");
  }
};

export default getArtistSegmentComments;
