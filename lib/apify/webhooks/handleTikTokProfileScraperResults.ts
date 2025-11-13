import getDataset from "@/lib/apify/getDataset";
import { Tables, TablesInsert } from "@/types/database.types";
import { z } from "zod";
import upsertSocials from "@/lib/supabase/socials/upsertSocials";
import apifyPayloadSchema from "./apifyPayloadSchema";
import { getFetchableUrl } from "@/lib/arweave/getFetchableUrl";
import uploadPfpToArweave from "@/lib/arweave/uploadPfpToArweave";

type TikTokDatasetItem = {
  authorMeta?: {
    name?: string;
    nickName?: string;
    profileUrl?: string;
    signature?: string | null;
    avatar?: string | null;
    originalAvatarUrl?: string | null;
    fans?: number;
    following?: number;
  } | null;
};

const selectAvatarSource = (authorMeta: TikTokDatasetItem["authorMeta"]) => {
  if (!authorMeta) return null;
  return authorMeta.originalAvatarUrl ?? authorMeta.avatar ?? null;
};

const toSocialPayload = (
  authorMeta: NonNullable<TikTokDatasetItem["authorMeta"]>,
  avatar: string | null
): TablesInsert<"socials"> => {
  return {
    username: authorMeta.name || authorMeta.nickName || "",
    bio: authorMeta.signature ?? null,
    profile_url: authorMeta.profileUrl ?? "",
    avatar,
    followerCount: typeof authorMeta.fans === "number" ? authorMeta.fans : null,
    followingCount:
      typeof authorMeta.following === "number" ? authorMeta.following : null,
  };
};

export default async function handleTikTokProfileScraperResults(
  parsed: z.infer<typeof apifyPayloadSchema>
) {
  const datasetId = parsed.resource.defaultDatasetId;
  let social: Tables<"socials"> | null = null;

  if (!datasetId) {
    return { social };
  }

  const dataset = await getDataset(datasetId);

  if (!Array.isArray(dataset) || dataset.length === 0) {
    return { social };
  }

  const firstResult = dataset[0] as TikTokDatasetItem;
  const authorMeta = firstResult?.authorMeta;

  if (!authorMeta?.profileUrl) {
    return { social };
  }

  let avatar = authorMeta.avatar ?? null;
  const avatarSource = selectAvatarSource(authorMeta);

  if (avatarSource) {
    const arweaveResult = await uploadPfpToArweave(avatarSource);
    if (arweaveResult) {
      const fetchableUrl = getFetchableUrl(arweaveResult);
      if (fetchableUrl) {
        avatar = fetchableUrl;
      }
    }
  }

  const socialPayload = toSocialPayload(authorMeta, avatar);

  if (!socialPayload.username || !socialPayload.profile_url) {
    return { social };
  }

  const upsertedSocials = await upsertSocials([socialPayload]);
  social = upsertedSocials[0] ?? null;

  return { social };
}
