import getDataset from "../apify/getDataset";
import getFormattedAccount from "./getFormattedAccount";
import getProfileDatasetId from "./getProfileDatasetId";
import { Social } from "../../types/agent";

const getProfile = async (
  handle: string
): Promise<{
  error: any;
  profile: null | Social;
  videoUrls: null | string[];
}> => {
  try {
    const profileDatasetId = await getProfileDatasetId(handle);
    while (1) {
      const datasetItems: any = await getDataset(profileDatasetId);
      const error = datasetItems?.[0]?.error;
      if (error)
        return {
          error,
          profile: null,
          videoUrls: null,
        };
      const formattedAccount = getFormattedAccount(datasetItems);
      if (formattedAccount?.profile)
        return {
          error: null,
          profile: formattedAccount.profile,
          videoUrls: formattedAccount.videoUrls,
        };
    }
    throw new Error();
  } catch (error) {
    console.error(error);
    return {
      profile: null,
      videoUrls: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error scraping profile"),
    };
  }
};

export default getProfile;
