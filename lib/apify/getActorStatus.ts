import dotenv from "dotenv";
import { APIFY_TOKEN } from "../consts";

dotenv.config();

interface ActorRunStatus {
  status: string;
  datasetId: string;
}

const getActorStatus = async (runId: string): Promise<ActorRunStatus> => {
  try {
    console.log("getActorStatus: run ID", { runId });

    const response = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data: any = await response.json();

    if (!data?.data?.status) {
      console.error("Invalid response from Apify:", data);
      return { status: "UNKNOWN", datasetId: "" };
    }

    return {
      status: data.data.status,
      datasetId: data.data.defaultDatasetId || "",
    };
  } catch (error) {
    console.error("Error fetching actor status:", error);
    return { status: "RUNNING", datasetId: "" };
  }
};

export default getActorStatus;
