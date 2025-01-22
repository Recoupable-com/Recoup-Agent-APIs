import dotenv from "dotenv";
import { APIFY_TOKEN } from "../consts";

dotenv.config();

const getActorStatus = async (datasetId: string) => {
  try {
    const response = await fetch(
      `https://api.apify.com/v2/actor-runs?token=${APIFY_TOKEN}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data: any = await response.json();

    const actorStatus = data.data.items.find(
      (item: any) => item.defaultDatasetId === datasetId,
    );
    return actorStatus.status;
  } catch (error) {
    return "RUNNING";
  }
};

export default getActorStatus;
