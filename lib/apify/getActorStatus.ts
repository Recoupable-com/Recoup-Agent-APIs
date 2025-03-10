import dotenv from "dotenv";
import { APIFY_TOKEN } from "../consts";

dotenv.config();

const getActorStatus = async (datasetId: string) => {
  try {
    console.log("getActorStatus: Dataset ID", { datasetId });

    const response = await fetch(
      `https://api.apify.com/v2/actor-runs/${datasetId}?token=${APIFY_TOKEN}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data: any = await response.json();

    console.log("getActorStatus: Data", { data });
    console.log("getActorStatus: Items", { items: data.data.items });
    const actorStatus = data.data.items.find(
      (item: any) => item.defaultDatasetId === datasetId
    );
    console.log("getActorStatus: Actor status", { actorStatus });
    return actorStatus.status;
  } catch (error) {
    console.error(error);
    return "RUNNING";
  }
};

export default getActorStatus;
