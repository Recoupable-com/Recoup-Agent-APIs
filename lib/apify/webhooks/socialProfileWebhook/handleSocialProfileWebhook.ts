import getDataset from "@/lib/apify/getDataset";
import { getFetchableUrl } from "@/lib/arweave/getFetchableUrl";
import uploadPfpToArweave from "@/lib/arweave/uploadPfpToArweave";
import upsertSocials from "@/lib/supabase/socials/upsertSocials";
import { z } from "zod";
import apifyPayloadSchema from "../apifyPayloadSchema";
import { Tables } from "@/types/database.types";
import { getSocialProfileParser } from "./getSocialProfileParser";

export type SocialProfileHandlerResult = {
  social: Tables<"socials"> | null;
};

export default async function handleSocialProfileWebhook(
  parsed: z.infer<typeof apifyPayloadSchema>
): Promise<SocialProfileHandlerResult> {
  const datasetId = parsed.resource.defaultDatasetId;
  let social: SocialProfileHandlerResult["social"] = null;

  if (!datasetId) {
    return { social };
  }

  const parser = getSocialProfileParser(parsed.eventData.actorId);

  if (!parser) {
    console.log(`Unhandled actorId: ${parsed.eventData.actorId}`);
    return { social };
  }

  const dataset = await getDataset(datasetId);
  const { payload } = await parser(dataset);

  if (!payload) {
    return { social };
  }

  if (payload.avatar) {
    const arweaveResult = await uploadPfpToArweave(payload.avatar);
    if (arweaveResult) {
      const fetchableUrl = getFetchableUrl(arweaveResult);
      if (fetchableUrl) {
        payload.avatar = fetchableUrl;
      }
    }
  }

  if (!payload.username || !payload.profile_url) {
    return { social };
  }

  const upsertedSocials = await upsertSocials([payload]);
  social = upsertedSocials[0] ?? null;

  return { social };
}
