import { OUTSTANDING_ERROR } from "../twitter/errors.js";

const getProfileDatasetId = async (handle) => {
  const profiles = [handle];
  const input = {
    resultsPerPage: 10,
    proxyCountryCode: "None",
    profiles,
  };

  try {
    const response = await runTikTokActor(input, "clockworks~tiktok-scraper");

    const error = response?.error;
    if (error) throw new Error(OUTSTANDING_ERROR);
    return response;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export default getProfileDatasetId;
