import getDataset from "../getDataset";
import { Tables } from "../../../types/database.types";
import { z } from "zod";
import upsertSocials from "../../supabase/socials/upsertSocials";
import apifyPayloadSchema from "./apifyPayloadSchema";
import { getFetchableUrl } from "../../arweave/getFetchableUrl";
import uploadPfpToArweave from "../../arweave/uploadPfpToArweave";

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

  if (datasetId) {
    const dataset = await getDataset(datasetId);
    const firstResult = dataset[0];
    if (firstResult?.latestPosts) {
      const arweaveResult = await uploadPfpToArweave(
        firstResult.profilePicUrlHD || firstResult.profilePicUrl
      );
      if (arweaveResult) {
        const fetchableUrl = getFetchableUrl(arweaveResult);
        if (fetchableUrl) {
          firstResult.profilePicUrl = fetchableUrl;
        }
      }

      const updatedResult = {
        username: firstResult.username,
        avatar: firstResult.profilePicUrl,
        profile_url: firstResult.url,
        bio: firstResult.biography,
        followerCount: firstResult.followersCount,
        followingCount: firstResult.followsCount,
      };

      social = (await upsertSocials([updatedResult]))[0];
      console.log("Social upserted successfully:", social);
    }
  }

  return {
    social,
  };
}
