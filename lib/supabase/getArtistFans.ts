import { Social } from "../../types/agent";
import { getArtistSegmentIds } from "./getArtistSegmentIds";
import { getFanSocialIds } from "./getFanSocialIds";
import { getSocialsByIds } from "./getSocialsByIds";

interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface GetArtistFansResponse {
  status: string;
  socials: Social[];
  pagination: PaginationMetadata;
}

interface PaginationOptions {
  limit?: number;
  page?: number;
}

/**
 * Gets all fans for an artist by joining artist_segments and fan_segments tables
 * @param artistAccountId The artist account ID to get fans for
 * @param options Pagination options (limit and page)
 * @returns Object containing status, array of unique fan socials, and pagination metadata
 */
export const getArtistFans = async (
  artistAccountId: string,
  options: PaginationOptions = {}
): Promise<GetArtistFansResponse> => {
  const { limit = 20, page = 1 } = options;
  const createEmptyPagination = (): PaginationMetadata => ({
    total: 0,
    page,
    limit,
    hasMore: false,
  });

  const createErrorResponse = (status: string): GetArtistFansResponse => ({
    status,
    socials: [],
    pagination: createEmptyPagination(),
  });

  try {
    const { status: segmentStatus, segmentIds } =
      await getArtistSegmentIds(artistAccountId);
    if (segmentStatus === "error" || !segmentIds.length) {
      return createErrorResponse(segmentStatus);
    }

    const { status: socialIdsStatus, socialIds } =
      await getFanSocialIds(segmentIds);
    if (socialIdsStatus === "error" || !socialIds.length) {
      return createErrorResponse(socialIdsStatus);
    }

    const total = socialIds.length;
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    const paginatedSocialIds = socialIds.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    const { status: socialsStatus, socials } =
      await getSocialsByIds(paginatedSocialIds);

    return {
      status: socialsStatus,
      socials,
      pagination: {
        total,
        page,
        limit,
        hasMore,
      },
    };
  } catch (error) {
    console.error("[ERROR] Unexpected error in getArtistFans:", error);
    return createErrorResponse("error");
  }
};

export default getArtistFans;
