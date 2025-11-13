import type { SocialProfileParser, SocialProfileParserResult } from "./types";
import type { TablesInsert } from "@/types/database.types";

type InstagramDatasetItem = {
  username?: string;
  biography?: string;
  url?: string;
  profilePicUrl?: string | null;
  profilePicUrlHD?: string | null;
  followersCount?: number;
  followsCount?: number;
} | null;

export const instagramProfileParser: SocialProfileParser = (
  datasetItem: unknown
): SocialProfileParserResult => {
  const item = (datasetItem ?? null) as InstagramDatasetItem;

  if (!item) {
    return { payload: null };
  }

  const payload: TablesInsert<"socials"> = {
    username: item.username ?? "",
    bio: item.biography ?? null,
    profile_url: item.url ?? "",
    avatar: item.profilePicUrlHD ?? item.profilePicUrl ?? null,
    followerCount:
      typeof item.followersCount === "number" ? item.followersCount : null,
    followingCount:
      typeof item.followsCount === "number" ? item.followsCount : null,
  };

  if (!payload.username || !payload.profile_url) {
    return { payload: null };
  }

  return {
    payload,
  };
};
