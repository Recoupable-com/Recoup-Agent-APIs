import { APIFY_TOKEN } from "../consts";

interface ApifyRunResponse {
  runId: string;
  datasetId: string;
  error?: string;
  data?: any;
}

const runApifyActor = async (
  input: any,
  actorId: string,
  webhooks?: string
): Promise<ApifyRunResponse | null> => {
  try {
    // Build URL with optional webhooks parameter
    let url = `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`;
    if (webhooks) {
      url += `&webhooks=${encodeURIComponent(webhooks)}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const data: any = await response.json();
    const error = data?.error;
    if (error?.message)
      return { error: error.message, runId: "", datasetId: "" };

    const runId = data?.data?.id;
    const datasetId = data?.data?.defaultDatasetId;

    if (!runId || !datasetId) {
      console.error("Missing runId or datasetId in Apify response:", data);
      return null;
    }

    return { runId, datasetId, data };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default runApifyActor;
