import supabase from "./serverClient";

// Define types for request parameters and response
export interface GetSocialPostsParams {
  social_id: string;
  latestFirst?: boolean;
  page?: number;
  limit?: number;
}

export interface SocialPost {
  id: string;
  post_id: string;
  social_id: string;
  post_url: string;
  updated_at: string;
}

export interface GetSocialPostsResponse {
  status: "success" | "error";
  message?: string;
  posts: SocialPost[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

/**
 * Retrieves social media posts for a specific social profile
 * @param params - Parameters including social_id and optional pagination/sorting
 * @returns List of posts with pagination metadata
 */
export const getSocialPostsNew = async (
  params: GetSocialPostsParams
): Promise<GetSocialPostsResponse> => {
  try {
    const { social_id, latestFirst = true, page = 1, limit = 20 } = params;

    // Validate parameters
    if (!social_id) {
      throw new Error("social_id is required");
    }

    // Ensure limit is within reasonable bounds
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (page - 1) * validatedLimit;

    // Get total count for pagination
    const { count } = await supabase
      .from("social_posts")
      .select("*", { count: "exact", head: true })
      .eq("social_id", social_id);

    // If no results, return empty array with pagination
    if (!count || count === 0) {
      return {
        status: "success",
        posts: [],
        pagination: {
          total_count: 0,
          page,
          limit: validatedLimit,
          total_pages: 0,
        },
      };
    }

    // Fetch posts with pagination and sorting
    const { data: socialPosts, error } = await supabase
      .from("social_posts")
      .select(
        `
        id,
        post_id,
        social_id,
        post:posts (
          id,
          post_url,
          updated_at
        )
      `
      )
      .eq("social_id", social_id)
      .order("updated_at", { ascending: !latestFirst }) // If latestFirst is true, order by descending (newest first)
      .range(offset, offset + validatedLimit - 1);

    if (error) {
      console.error("[ERROR] Failed to fetch social posts:", error);
      throw error;
    }

    // Transform data to match the expected response format
    const posts = socialPosts.map((item: any) => ({
      id: item.id,
      post_id: item.post_id,
      social_id: item.social_id,
      post_url: item.post.post_url,
      updated_at: item.post.updated_at,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / validatedLimit);

    return {
      status: "success",
      posts,
      pagination: {
        total_count: count,
        page,
        limit: validatedLimit,
        total_pages: totalPages,
      },
    };
  } catch (error) {
    console.error("[ERROR] getSocialPostsNew error:", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      posts: [],
      pagination: {
        total_count: 0,
        page: 1,
        limit: 20,
        total_pages: 0,
      },
    };
  }
};
