import { APIFY_TOKEN } from "../consts";

const runTikTokActor = async (input: any, actorId: string) => {
  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      },
    );

    const data: any = await response.json();
    const error = data?.error;
    const defaultDatasetId = data?.data?.defaultDatasetId;
    if (error?.message) return { error: error?.message };
    return defaultDatasetId;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default runTikTokActor;
