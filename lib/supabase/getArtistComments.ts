import getArtistPostIds from "./getArtistPostIds";
import getCommentsCount from "./getCommentsCount";
import getPaginatedComments from "./getPaginatedComments";
import { Comment } from "../../types/agent";

interface GetArtistCommentsParams {
  artist_account_id: string;
  post_id?: string;
  page?: number;
  limit?: number;
}

interface GetArtistCommentsResponse {
  status: "success" | "error";
  comments: Comment[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  message?: string;
}

export const getArtistComments = async ({
  artist_account_id,
  post_id,
  page = 1,
  limit = 10,
}: GetArtistCommentsParams): Promise<GetArtistCommentsResponse> => {
  try {
    console.log("[DEBUG] getArtistComments called with params:", {
      artist_account_id,
      post_id,
      page,
      limit,
    });

    const offset = (page - 1) * limit;

    // Get all post IDs for the artist
    const postIds = await getArtistPostIds({ artist_account_id, post_id });

    if (!postIds.length) {
      return {
        status: "success",
        comments: [],
        pagination: {
          total_count: 0,
          page,
          limit,
          total_pages: 0,
        },
      };
    }

    // Get total comment count
    const total_count = await getCommentsCount(postIds);

    if (!total_count) {
      return {
        status: "success",
        comments: [],
        pagination: {
          total_count: 0,
          page,
          limit,
          total_pages: 0,
        },
      };
    }

    // Get paginated comments
    const comments = await getPaginatedComments({
      postIds,
      offset,
      limit,
    });

    const total_pages = Math.ceil(total_count / limit);

    return {
      status: "success",
      comments,
      pagination: {
        total_count,
        page,
        limit,
        total_pages,
      },
    };
  } catch (error) {
    console.error("[ERROR] Error in getArtistComments:", error);
    throw error;
  }
};
