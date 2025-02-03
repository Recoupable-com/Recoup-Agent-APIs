import runTikTokActor from "../apify/runTikTokActor";
import { OUTSTANDING_ERROR } from "../twitter/errors";

const getProfileDatasetId = async (handle: string) => {
  const input = {
    usernames: [handle],
  };

  try {
    const response = await runTikTokActor(
      input,
      "apify~instagram-profile-scraper",
    );

    const error = response?.error;
    if (error) throw new Error(OUTSTANDING_ERROR);
    return response;
  } catch (error) {
    console.error(error);
    return null
  }
};

export default getProfileDatasetId;
