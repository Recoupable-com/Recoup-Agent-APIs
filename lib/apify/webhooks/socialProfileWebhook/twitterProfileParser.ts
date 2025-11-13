import type { SocialProfileParser, SocialProfileParserResult } from "./types";
import type { TablesInsert } from "@/types/database.types";

type TwitterAuthor = {
  userName?: string | null;
  description?: string | null;
  url?: string | null;
  twitterUrl?: string | null;
  profilePicture?: string | null;
  followers?: number | null;
  following?: number | null;
} | null;

type TwitterDatasetItem = {
  author?: TwitterAuthor;
} | null;

export const twitterProfileParser: SocialProfileParser = (
  datasetItem: unknown
): SocialProfileParserResult => {
  const item = (datasetItem ?? null) as TwitterDatasetItem;
  const author = item?.author ?? null;

  if (!author) {
    return { payload: null };
  }

  const payload: TablesInsert<"socials"> = {
    username: author.userName ?? "",
    bio: author.description ?? null,
    profile_url: author.url ?? author.twitterUrl ?? "",
    avatar: author.profilePicture ?? null,
    followerCount: author.followers ?? null,
    followingCount: author.following ?? null,
  };

  if (!payload.username || !payload.profile_url) {
    return { payload: null };
  }

  return { payload };
};
