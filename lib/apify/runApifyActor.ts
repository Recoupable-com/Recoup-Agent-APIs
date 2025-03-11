import { APIFY_TOKEN } from "../consts";

interface ApifyRunResponse {
  runId: string;
  datasetId: string;
  error?: string;
}

const runApifyActor = async (
  input: any,
  actorId: string
): Promise<ApifyRunResponse | null> => {
  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      }
    );

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

    return { runId, datasetId };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default runApifyActor;
