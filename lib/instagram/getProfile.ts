import getDataset from "../apify/getDataset";
import getFormattedAccount from "./getFormattedAccount";
import getProfileDatasetId from "./getProfileDatasetId";

const getProfile = async (handle: string) => {
  try {
    const profileDatasetId = await getProfileDatasetId(handle);
    while (1) {
      const datasetItems: any = await getDataset(profileDatasetId);
      console.log("ZIAD", datasetItems)
      const error = datasetItems?.[0]?.error;
      if (error)
        return {
          error,
          profile: null,
          postUrls: null,
        };
      const formattedAccount = getFormattedAccount(datasetItems);
      if (formattedAccount)
        return {
          error: null,
          profile: formattedAccount.profile,
          postUrls: formattedAccount.postUrls,
        };
    }
    throw new Error();
  } catch (error) {
    console.error(error);
    return {
      profile: null,
      postUrls: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error scraping profile"),
    };
  }
};

export default getProfile;
