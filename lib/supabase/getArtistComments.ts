import getArtistPostIds from "./getArtistPostIds";
import getCommentsCount from "./getCommentsCount";
import getPaginatedComments from "./getPaginatedComments";

interface GetArtistCommentsParams {
  artist_account_id: string;
  post_id?: string;
  page?: number;
  limit?: number;
}

export const getArtistComments = async ({
  artist_account_id,
  post_id,
  page = 1,
  limit = 10,
}: GetArtistCommentsParams) => {
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
        data: {
          comments: [],
          pagination: {
            current_page: page,
            total_pages: 0,
            total_comments: 0,
            per_page: limit,
          },
        },
      };
    }

    // Get total comment count
    const total_comments = await getCommentsCount(postIds);

    if (!total_comments) {
      return {
        status: "success",
        data: {
          comments: [],
          pagination: {
            current_page: page,
            total_pages: 0,
            total_comments: 0,
            per_page: limit,
          },
        },
      };
    }

    // Get paginated comments
    const comments = await getPaginatedComments({
      postIds,
      offset,
      limit,
    });

    const total_pages = Math.ceil(total_comments / limit);

    return {
      status: "success",
      data: {
        comments,
        pagination: {
          current_page: page,
          total_pages,
          total_comments,
          per_page: limit,
        },
      },
    };
  } catch (error) {
    console.error("[ERROR] Error in getArtistComments:", error);
    throw error;
  }
};
