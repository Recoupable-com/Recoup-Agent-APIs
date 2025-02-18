import { getAccountSocials } from "./getAccountSocials";
import getFansBySegment from "./getFansBySegment";
import getCommentsBySocialIds from "./getCommentsBySocialIds";
import getSegmentById from "./getSegmentById";

interface ArtistSegmentCommentsResponse {
  comments: string[];
  socialMetrics: {
    followerCount: number;
    username: string;
    avatar: string;
  };
  segmentName: string;
}

const getArtistSegmentComments = async (
  artistId: string,
  segmentId: string
): Promise<ArtistSegmentCommentsResponse> => {
  try {
    const { name: segmentName, error: segmentError } =
      await getSegmentById(segmentId);
    if (segmentError || !segmentName) {
      throw new Error("Failed to get segment name");
    }

    const { status, socials } = await getAccountSocials(artistId);
    if (status === "error" || !socials.length) {
      throw new Error("Failed to fetch social accounts");
    }

    const { fanSocialIds, error: fansError } =
      await getFansBySegment(segmentId);
    if (fansError) {
      throw fansError;
    }

    const { comments, error: commentsError } =
      await getCommentsBySocialIds(fanSocialIds);
    if (commentsError) {
      throw commentsError;
    }

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
      segmentName,
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Unknown error in getArtistSegmentComments");
  }
};

export default getArtistSegmentComments;
