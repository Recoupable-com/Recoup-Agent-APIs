import supabase from "./serverClient";

interface GetArtistSegmentsParams {
  artist_account_id: string;
  page?: number;
  limit?: number;
}

interface GetArtistSegmentsResponse {
  status: "success" | "error";
  segments: {
    id: string;
    artist_account_id: string;
    segment_id: string;
    updated_at: string;
    segment_name: string;
    artist_name: string;
  }[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  message?: string;
}

interface SegmentQueryResult {
  id: string;
  artist_account_id: string;
  segment_id: string;
  updated_at: string | null;
  segments: {
    name: string | null;
  } | null;
  accounts: {
    name: string | null;
  } | null;
}

export const getArtistSegments = async ({
  artist_account_id,
  page = 1,
  limit = 20,
}: GetArtistSegmentsParams): Promise<GetArtistSegmentsResponse> => {
  try {
    console.log("[DEBUG] getArtistSegments called with params:", {
      artist_account_id,
      page,
      limit,
    });

    // Validate limit is between 1 and 100
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (page - 1) * validatedLimit;

    // Get total count first
    const { count } = await supabase
      .from("artist_segments")
      .select("*", { count: "exact", head: true })
      .eq("artist_account_id", artist_account_id);

    const total_count = count || 0;

    if (total_count === 0) {
      return {
        status: "success",
        segments: [],
        pagination: {
          total_count: 0,
          page,
          limit: validatedLimit,
          total_pages: 0,
        },
      };
    }

    // Get paginated segments with joins - using simpler query with no inner joins
    const queryText = `
      id,
      artist_account_id,
      segment_id,
      updated_at,
      segments (
        name
      ),
      accounts:artist_account_id (
        name
      )
    `;

    const { data, error } = await supabase
      .from("artist_segments")
      .select(queryText)
      .eq("artist_account_id", artist_account_id)
      .order("updated_at", { ascending: false })
      .range(offset, offset + validatedLimit - 1);

    if (error) {
      console.error("[ERROR] Error fetching artist segments:", error);
      throw error;
    }

    if (!data) {
      return {
        status: "success",
        segments: [],
        pagination: {
          total_count: 0,
          page,
          limit: validatedLimit,
          total_pages: 0,
        },
      };
    }

    const segments = data as unknown as SegmentQueryResult[];
    const formattedSegments = segments.map((segment) => ({
      id: segment.id,
      artist_account_id: segment.artist_account_id,
      segment_id: segment.segment_id,
      updated_at: segment.updated_at || new Date().toISOString(),
      segment_name: segment.segments?.name || "Unknown Segment",
      artist_name: segment.accounts?.name || "Unknown Artist",
    }));

    const total_pages = Math.ceil(total_count / validatedLimit);

    return {
      status: "success",
      segments: formattedSegments,
      pagination: {
        total_count,
        page,
        limit: validatedLimit,
        total_pages,
      },
    };
  } catch (error) {
    console.error("[ERROR] Error in getArtistSegments:", error);
    throw error;
  }
};
