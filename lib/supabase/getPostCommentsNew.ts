import supabase from "./serverClient";

// Define interface for request parameters
export interface GetPostCommentsParams {
  post_id: string;
  page?: number;
  limit?: number;
}

// Define interface for a comment in the response
export interface PostComment {
  id: string;
  post_id: string;
  social_id: string;
  comment: string;
  commented_at: string;
  username: string;
  avatar: string | null;
  profile_url: string;
  post_url: string;
  region: string | null;
  bio: string | null;
  follower_count: number | null;
  following_count: number | null;
}

// Define interface for the response
export interface GetPostCommentsResponse {
  status: "success" | "error";
  message?: string;
  comments: PostComment[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// Define interface for the query result from Supabase
// Note: Supabase returns nested joins as arrays rather than objects
interface CommentQueryResult {
  id: string;
  post_id: string;
  social_id: string;
  comment: string;
  commented_at: string;
  post: {
    post_url: string;
  }[];
  social: {
    username: string;
    avatar: string | null;
    profile_url: string;
    region: string | null;
    bio: string | null;
    followerCount: number | null;
    followingCount: number | null;
  }[];
}

/**
 * Retrieves comments for a specific post
 * @param params - Parameters including post_id and optional pagination
 * @returns List of comments with pagination metadata
 */
export const getPostCommentsNew = async (
  params: GetPostCommentsParams
): Promise<GetPostCommentsResponse> => {
  try {
    const { post_id, page = 1, limit = 20 } = params;

    // Validate parameters
    if (!post_id) {
      throw new Error("post_id is required");
    }

    // Ensure limit is within reasonable bounds
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (page - 1) * validatedLimit;

    // Get total count for pagination
    const { count } = await supabase
      .from("post_comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post_id);

    // If no results, return empty array with pagination
    if (!count || count === 0) {
      return {
        status: "success",
        comments: [],
        pagination: {
          total_count: 0,
          page,
          limit: validatedLimit,
          total_pages: 0,
        },
      };
    }

    // Fetch comments with pagination
    const { data: commentData, error } = await supabase
      .from("post_comments")
      .select(
        `
        id,
        post_id,
        social_id,
        comment,
        commented_at,
        post:posts (
          post_url
        ),
        social:socials (
          username,
          avatar,
          profile_url,
          region,
          bio,
          followerCount,
          followingCount
        )
      `
      )
      .eq("post_id", post_id)
      .order("commented_at", { ascending: false }) // Newest first
      .range(offset, offset + validatedLimit - 1);

    if (error) {
      console.error("[ERROR] Failed to fetch post comments:", error);
      throw error;
    }

    // Transform data to match the expected response format
    const comments = (commentData as CommentQueryResult[]).map((item) => ({
      id: item.id,
      post_id: item.post_id,
      social_id: item.social_id,
      comment: item.comment,
      commented_at: item.commented_at,
      username: item.social[0]?.username || "",
      avatar: item.social[0]?.avatar || null,
      profile_url: item.social[0]?.profile_url || "",
      post_url: item.post[0]?.post_url || "",
      region: item.social[0]?.region || null,
      bio: item.social[0]?.bio || null,
      follower_count: item.social[0]?.followerCount || null,
      following_count: item.social[0]?.followingCount || null,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / validatedLimit);

    return {
      status: "success",
      comments,
      pagination: {
        total_count: count,
        page,
        limit: validatedLimit,
        total_pages: totalPages,
      },
    };
  } catch (error) {
    console.error("[ERROR] getPostCommentsNew error:", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      comments: [],
      pagination: {
        total_count: 0,
        page: 1,
        limit: 20,
        total_pages: 0,
      },
    };
  }
};

export default getPostCommentsNew;
