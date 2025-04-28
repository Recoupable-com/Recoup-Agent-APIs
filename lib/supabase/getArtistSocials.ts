import supabase from "./serverClient";

// Define types for request parameters and response
export interface GetArtistSocialsParams {
  artist_account_id: string;
  page?: number;
  limit?: number;
}

export interface ArtistSocialResponse {
  id: string;
  social_id: string;
  username: string;
  profile_url: string;
  avatar: string | null;
  bio: string | null;
  follower_count: number | null;
  following_count: number | null;
  region: string | null;
  updated_at: string;
}

export interface GetArtistSocialsResponse {
  status: "success" | "error";
  message?: string;
  socials: ArtistSocialResponse[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

/**
 * Retrieves all social profiles associated with an artist account
 * @param params - Parameters including artist_account_id and optional pagination
 * @returns List of social profiles with pagination metadata
 */
export const getArtistSocials = async (
  params: GetArtistSocialsParams
): Promise<GetArtistSocialsResponse> => {
  try {
    const { artist_account_id, page = 1, limit = 20 } = params;

    // Validate parameters
    if (!artist_account_id) {
      throw new Error("artist_account_id is required");
    }

    // Ensure limit is within reasonable bounds
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (page - 1) * validatedLimit;

    // Get total count for pagination
    const { count } = await supabase
      .from("account_socials")
      .select("*", { count: "exact", head: true })
      .eq("account_id", artist_account_id);

    // If no results, return empty array with pagination
    if (!count || count === 0) {
      return {
        status: "success",
        socials: [],
        pagination: {
          total_count: 0,
          page,
          limit: validatedLimit,
          total_pages: 0,
        },
      };
    }

    // Fetch social profiles with pagination
    const { data: accountSocials, error } = await supabase
      .from("account_socials")
      .select(
        `
        id,
        social_id,
        social:socials (
          id,
          username,
          profile_url,
          avatar,
          bio,
          followerCount,
          followingCount,
          region,
          updated_at
        )
      `
      )
      .eq("account_id", artist_account_id)
      .order("id", { ascending: true })
      .range(offset, offset + validatedLimit - 1);

    if (error) {
      console.error("[ERROR] Failed to fetch artist socials:", error);
      throw error;
    }

    // Transform data to match the expected response format
    const socials = accountSocials.map((item: any) => ({
      id: item.id,
      social_id: item.social_id,
      username: item.social.username,
      profile_url: item.social.profile_url,
      avatar: item.social.avatar,
      bio: item.social.bio,
      follower_count: item.social.followerCount,
      following_count: item.social.followingCount,
      region: item.social.region,
      updated_at: item.social.updated_at,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / validatedLimit);

    return {
      status: "success",
      socials,
      pagination: {
        total_count: count,
        page,
        limit: validatedLimit,
        total_pages: totalPages,
      },
    };
  } catch (error) {
    console.error("[ERROR] getArtistSocials error:", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      socials: [],
      pagination: {
        total_count: 0,
        page: 1,
        limit: 20,
        total_pages: 0,
      },
    };
  }
};
