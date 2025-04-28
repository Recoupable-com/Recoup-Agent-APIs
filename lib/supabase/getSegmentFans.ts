import supabase from "./serverClient";
import { Database } from "../../types/database.types";

type DbFanSegment = Database["public"]["Tables"]["fan_segments"]["Row"];
type DbSegment = Database["public"]["Tables"]["segments"]["Row"];
type DbSocial = Database["public"]["Tables"]["socials"]["Row"];

interface GetSegmentFansParams {
  segment_id: string;
  page?: number;
  limit?: number;
}

interface FanProfile {
  id: string;
  username: string;
  avatar: string | null;
  profile_url: string;
  segment_id: string;
  segment_name: string;
  fan_social_id: string;
  region: string | null;
  bio: string | null;
  follower_count: number | null;
  following_count: number | null;
  updated_at: string;
}

interface GetSegmentFansResponse {
  status: "success" | "error";
  fans: FanProfile[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  message?: string;
}

interface FanQueryResult {
  id: DbFanSegment["id"];
  segment_id: DbFanSegment["segment_id"];
  fan_social_id: DbFanSegment["fan_social_id"];
  updated_at: DbFanSegment["updated_at"];
  segments: {
    name: DbSegment["name"];
  } | null;
  socials: {
    username: DbSocial["username"];
    avatar: DbSocial["avatar"];
    profile_url: DbSocial["profile_url"];
    region: DbSocial["region"];
    bio: DbSocial["bio"];
    followerCount: DbSocial["followerCount"];
    followingCount: DbSocial["followingCount"];
  } | null;
}

export const getSegmentFans = async ({
  segment_id,
  page = 1,
  limit = 20,
}: GetSegmentFansParams): Promise<GetSegmentFansResponse> => {
  try {
    console.log("[DEBUG] getSegmentFans called with params:", {
      segment_id,
      page,
      limit,
    });

    // Validate limit is between 1 and 100
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (page - 1) * validatedLimit;

    // Get total count first
    const { count } = await supabase
      .from("fan_segments")
      .select("*", { count: "exact", head: true })
      .eq("segment_id", segment_id);

    const total_count = count || 0;

    if (total_count === 0) {
      return {
        status: "success",
        fans: [],
        pagination: {
          total_count: 0,
          page,
          limit: validatedLimit,
          total_pages: 0,
        },
      };
    }

    // Get paginated fans with joins
    const queryText = `
      id,
      segment_id,
      fan_social_id,
      updated_at,
      segments (
        name
      ),
      socials (
        username,
        avatar,
        profile_url,
        region,
        bio,
        followerCount,
        followingCount
      )
    `;

    const { data, error } = await supabase
      .from("fan_segments")
      .select(queryText)
      .eq("segment_id", segment_id)
      .order("updated_at", { ascending: false })
      .range(offset, offset + validatedLimit - 1);

    if (error) {
      console.error("[ERROR] Error fetching segment fans:", error);
      throw error;
    }

    if (!data) {
      return {
        status: "success",
        fans: [],
        pagination: {
          total_count: 0,
          page,
          limit: validatedLimit,
          total_pages: 0,
        },
      };
    }

    const fans = data as unknown as FanQueryResult[];
    const formattedFans = fans.map((fan) => ({
      id: fan.id,
      username: fan.socials?.username || "Unknown User",
      avatar: fan.socials?.avatar || null,
      profile_url: fan.socials?.profile_url || "",
      segment_id: fan.segment_id,
      segment_name: fan.segments?.name || "Unknown Segment",
      fan_social_id: fan.fan_social_id,
      region: fan.socials?.region || null,
      bio: fan.socials?.bio || null,
      follower_count: fan.socials?.followerCount || 0,
      following_count: fan.socials?.followingCount || 0,
      updated_at: fan.updated_at || new Date().toISOString(),
    }));

    const total_pages = Math.ceil(total_count / validatedLimit);

    return {
      status: "success",
      fans: formattedFans,
      pagination: {
        total_count,
        page,
        limit: validatedLimit,
        total_pages,
      },
    };
  } catch (error) {
    console.error("[ERROR] Error in getSegmentFans:", error);
    throw error;
  }
};
