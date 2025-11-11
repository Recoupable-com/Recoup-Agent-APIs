import getDataset from "../getDataset";
import { Tables } from "../../../types/database.types";
import { z } from "zod";
import upsertSocials from "../../supabase/socials/upsertSocials";
import uploadLinkToArweave from "@/lib/arweave/uploadLinkToArweave";
import apifyPayloadSchema from "@/lib/apify/apifyPayloadSchema";
import { getFetchableUrl } from "@/lib/arweave/gateway";

/**
 * Handles Instagram profile scraper results: fetches dataset, saves posts, saves socials, and returns results.
 * @param parsed - The parsed and validated Apify webhook payload
 * @returns An object with posts, socials, accountSocials, accountArtistIds, accountEmails, and sentEmails
 */
export default async function handleInstagramProfileScraperResults(
  parsed: z.infer<typeof apifyPayloadSchema>
) {
  const datasetId = parsed.resource.defaultDatasetId;
  let social: Tables<"socials"> | null = null;
  let dataset;

  if (datasetId) {
    dataset = await getDataset(datasetId);
    const firstResult = dataset[0];
    if (firstResult?.latestPosts) {
      const arweaveResult = await uploadLinkToArweave(
        firstResult.profilePicUrlHD || firstResult.profilePicUrl
      );
      if (arweaveResult) {
        firstResult.profilePicUrl = getFetchableUrl(arweaveResult);
      }

      await upsertSocials([
        {
          username: firstResult.username,
          avatar: firstResult.profilePicUrl,
          profile_url: firstResult.url,
          bio: firstResult.biography,
          followerCount: firstResult.followersCount,
          followingCount: firstResult.followsCount,
        },
      ]);
    }
  }

  return {
    social,
  };
}
