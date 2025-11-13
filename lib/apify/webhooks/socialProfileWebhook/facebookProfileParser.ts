import type { SocialProfileParser, SocialProfileParserResult } from "./types";
import type { TablesInsert } from "@/types/database.types";

type FacebookDatasetItem = {
  pageName?: string | null;
  intro?: string | null;
  pageUrl?: string | null;
  facebookUrl?: string | null;
  profilePictureUrl?: string | null;
  followers?: number | null;
  followings?: number | null;
} | null;

export const facebookProfileParser: SocialProfileParser = (
  datasetItem: unknown
): SocialProfileParserResult => {
  const item = (datasetItem ?? null) as FacebookDatasetItem;

  if (!item) {
    return { payload: null };
  }

  const payload: TablesInsert<"socials"> = {
    username: item.pageName ?? "",
    bio: item.intro ?? null,
    profile_url: item.pageUrl ?? item.facebookUrl ?? "",
    avatar: item.profilePictureUrl ?? null,
    followerCount: item.followers ?? null,
    followingCount: item.followings ?? null,
  };

  if (!payload.username || !payload.profile_url) {
    return { payload: null };
  }

  return { payload };
};
