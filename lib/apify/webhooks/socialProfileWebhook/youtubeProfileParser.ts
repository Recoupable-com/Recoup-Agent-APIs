import type { SocialProfileParser, SocialProfileParserResult } from "./types";
import type { TablesInsert } from "@/types/database.types";
import { extractYoutubeUsernameFromUrl } from "@/lib/youtube/extractYoutubeUsernameFromUrl";

type YouTubeDatasetItem = {
  channelName?: string;
  channelDescription?: string | null;
  channelUrl?: string;
  channelAvatarUrl?: string | null;
  numberOfSubscribers?: number | null;
  channelTotalViews?: number | null;
  channelTotalVideos?: number | null;
  fromYTUrl?: string;
  inputChannelUrl?: string;
  channelUsername?: string | null;
} | null;

export const youtubeProfileParser: SocialProfileParser = (
  datasetItem: unknown
): SocialProfileParserResult => {
  const item = (datasetItem ?? null) as YouTubeDatasetItem;

  if (!item) {
    return { payload: null };
  }

  const payload: TablesInsert<"socials"> = {
    username:
      item.channelUsername ||
      item.channelName ||
      extractYoutubeUsernameFromUrl(item.channelUrl) ||
      "",
    bio: item.channelDescription ?? null,
    profile_url:
      item.inputChannelUrl || item.channelUrl || item.fromYTUrl || "",
    avatar: item.channelAvatarUrl ?? null,
    followerCount:
      typeof item.numberOfSubscribers === "number"
        ? item.numberOfSubscribers
        : null,
    followingCount: null,
  };

  if (!payload.username || !payload.profile_url) {
    return { payload: null };
  }

  return { payload };
};
