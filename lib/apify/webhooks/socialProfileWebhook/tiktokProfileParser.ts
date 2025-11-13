import type { SocialProfileParser, SocialProfileParserResult } from "./types";
import type { TablesInsert } from "@/types/database.types";

type TikTokAuthorMeta = {
  name?: string;
  nickName?: string;
  profileUrl?: string;
  signature?: string | null;
  avatar?: string | null;
  originalAvatarUrl?: string | null;
  fans?: number;
  following?: number;
} | null;

type TikTokDatasetItem = {
  authorMeta?: TikTokAuthorMeta;
} | null;

export const tiktokProfileParser: SocialProfileParser = (
  datasetItem: unknown
): SocialProfileParserResult => {
  const item = (datasetItem ?? null) as TikTokDatasetItem;
  const authorMeta = item?.authorMeta ?? null;

  if (!authorMeta) {
    return { payload: null };
  }

  const payload: TablesInsert<"socials"> = {
    username: authorMeta.name || authorMeta.nickName || "",
    bio: authorMeta.signature ?? null,
    profile_url: authorMeta.profileUrl ?? "",
    avatar: authorMeta.originalAvatarUrl ?? authorMeta.avatar ?? null,
    followerCount: typeof authorMeta.fans === "number" ? authorMeta.fans : null,
    followingCount:
      typeof authorMeta.following === "number" ? authorMeta.following : null,
  };

  if (!payload.username || !payload.profile_url) {
    return { payload: null };
  }

  return {
    payload,
  };
};
