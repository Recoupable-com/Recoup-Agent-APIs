import type { SocialProfileParser, SocialProfileParserResult } from "./types";
import type { TablesInsert } from "@/types/database.types";

type ThreadsHdProfilePicVersion = {
  url?: string | null;
} | null;

type ThreadsDatasetItem = {
  username?: string | null;
  biography?: string | null;
  url?: string | null;
  profile_pic_url?: string | null;
  hd_profile_pic_versions?: ThreadsHdProfilePicVersion[] | null;
  follower_count?: number | null;
} | null;

export const threadsProfileParser: SocialProfileParser = (
  datasetItem: unknown
): SocialProfileParserResult => {
  const item = (datasetItem ?? null) as ThreadsDatasetItem;

  if (!item) {
    return { payload: null };
  }

  const username = item.username ?? "";
  const profileUrl = item.url ?? "";
  const bio = item.biography ?? null;
  const rawHdAvatar = item.hd_profile_pic_versions?.[0]?.url ?? null;
  const avatarCandidate = rawHdAvatar ?? item.profile_pic_url ?? null;
  const followerCount = item.follower_count ?? null;
  const followingCount = null;

  const payload: TablesInsert<"socials"> = {
    username,
    bio,
    profile_url: profileUrl,
    avatar: avatarCandidate,
    followerCount,
    followingCount,
  };

  if (!payload.username || !payload.profile_url) {
    return { payload: null };
  }

  return { payload };
};
